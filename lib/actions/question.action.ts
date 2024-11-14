"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tags.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 7 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        {
          title: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
        {
          content: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;

      case "frequent":
        sortOptions = {
          views: -1,
        };
        break;

      case "unanswered":
        query.answers = { $size: 0 };
        break;

      default:
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      /* The tags path specifies which field to populate and model:
       Tag tells it which collection to pull the data from */

      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    /* create a question */

    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exist...

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    await Interaction.create({
      user: author,
      action: "ask-question",
      question: question._id,
      tags: tagDocuments,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({
        path: "tags",
        model: Tag,
        select: "_id name",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

export async function upvotesQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = {
        $pull: {
          upvotes: userId,
        },
      };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: {
          upvotes: userId,
        },
      };
    } else {
      updateQuery = {
        $addToSet: {
          upvotes: userId,
        },
      };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error(" Question not found ");
    }

    // Increment author's reputation by +1/-1 for voting or revoking an upvote

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -1 : 1 },
    });

    // Increment author's reputation by +10 / -10 for recieving an upvote / dpwnvote to the question.

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/* 

This line finds the question by questionId, applies updateQuery to 
modify the upvote/downvote fields, and returns the updated document, 
which is then stored in the question variable. 
You can now use this updated question data in the rest of your function,
knowing it reflects the latest changes.

*/

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = {
        $pull: {
          downvotes: userId,
        },
      };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: {
          downvotes: userId,
        },
      };
    } else {
      updateQuery = {
        $addToSet: {
          downvotes: userId,
        },
      };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error(" Question not found ");
    }

    // Increment author's reputation

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;

    await Question.deleteOne({
      _id: questionId,
    });

    await Answer.deleteMany({
      question: questionId,
    });

    await Interaction.deleteMany({
      question: questionId,
    });

    await Tag.updateMany(
      {
        question: questionId,
      },
      { $pull: { questions: questionId } }
    );

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, content, title, path } = params;

    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function getHotQuestions() {
  try {
    connectToDatabase();

    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
