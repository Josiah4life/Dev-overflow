"use server";

import { FilterQuery } from "mongoose";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tags.model";
import Answer from "@/database/answer.model";
import { CriteriaProps } from "@/types";
import { assignBadges } from "../utils";

export async function getUserById(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({
      clerkId: userId,
    });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({
      clerkId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // const userQuestionIds = await Question.find({
    //   author: user._id,
    // }).distinct("_id");

    await Question.deleteMany({
      author: user._id,
    });

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 1 } = params;
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        {
          name: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
        {
          username: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;
    }
    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { saved: questionId },
        },
        {
          new: true,
        }

        /* returns the new updated list "new: true" */
      );
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { saved: questionId },
        },
        {
          new: true,
        }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestion(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    const { clerkId, page = 1, pageSize = 3, filter, searchQuery } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = searchQuery // Filter based on SearchQuery otherwise retrives all saved.
      ? {
          title: {
            $regex: new RegExp(searchQuery, "i"),
          },
        }
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;

      case "oldest":
        sortOptions = { createdAt: 1 };
        break;

      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;

      case "most_viewed":
        sortOptions = { views: -1 };
        break;

      case "most_answered":
        sortOptions = { answers: -1 };
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query, // match all else can use select to explicit define the field to extract and display.
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },

      populate: [
        {
          path: "tags",
          model: Tag,
          select: "_id name ",
        },
        {
          path: "author",
          model: User,
          select: "_id clerkId name picture",
        },
      ],
    });

    const isNext = user.saved.length > pageSize;

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestions = user.saved.slice(0, pageSize);
    // const savedQuestions = user.saved;

    return {
      questions: savedQuestions,
      isNext,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({
      clerkId: userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({
      author: user._id,
    });
    const totalAnswers = await Answer.countDocuments({
      author: user._id,
    });
    const [questionUpvotes] = await Question.aggregate([
      {
        $match: {
          author: user._id,
        },
      },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },

      {
        $group: {
          _id: null,
          totalUpvotes: {
            $sum: "$upvotes",
          },
        },
      },
    ]);
    const [answerUpvotes] = await Answer.aggregate([
      {
        $match: {
          author: user._id,
        },
      },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },

      {
        $group: {
          _id: null,
          totalUpvotes: {
            $sum: "$upvotes",
          },
        },
      },
    ]);
    const [questionViews] = await Question.aggregate([
      {
        $match: {
          author: user._id,
        },
      },

      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$views",
          },
        },
      },
    ]);

    const criteria: CriteriaProps[] = [
      { type: "QUESTION_COUNT", count: totalQuestions },
      { type: "ANSWER_COUNT", count: totalQuestions },
      {
        type: "QUESTION_UPVOTES",
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES",
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS",
        count: questionViews?.totalUpvotes || 0,
      },
    ];

    const badgeCounts = assignBadges({
      criteria,
    });

    return {
      user,
      totalQuestions,
      totalAnswers,
      reputation: user.reputation,
      badgeCounts,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 3 } = params;

    const totalQuestion = await Question.countDocuments({ author: userId });
    const skipAmount = (page - 1) * pageSize;

    const userQuestions = await Question.find({
      author: userId,
    })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalQuestion > skipAmount + userQuestions.length;
    return {
      totalQuestion,
      questions: userQuestions,
      isNext,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 3 } = params;
    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswer = await Answer.find({
      author: userId,
    })
      .sort({ upvotes: -1 })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture")

      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalAnswers > skipAmount + userAnswer.length;

    return {
      totalAnswers,
      answers: userAnswer,
      isNext,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
