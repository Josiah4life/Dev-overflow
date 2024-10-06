// import { UserButton } from "@clerk/nextjs";

import QuestionCard from "@/components/card/QuestionCard";
import HomeFilter from "@/components/home/HomeFilter";
import Filter from "@/components/shared/Filter";
import LocalSearch from "@/components/shared/navbar/search/LocalSearch";
import NoResult from "@/components/shared/NoResult";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constant/filter";
import Link from "next/link";

const questions = [
  {
    _id: "q1",
    title: "What is TypeScript?",
    tags: [
      { _id: "t1", name: "JavaScript" },
      { _id: "t2", name: "TypeScript" },
    ],
    author: {
      _id: "a1",
      name: "John Doe",
      picture: "https://example.com/johndoe.jpg",
    },
    upvotes: 10,
    views: 12564564,
    answers: [
      {
        _id: "ans1",
        content: "TypeScript is a superset of JavaScript that adds types.",
        author: {
          _id: "a2",
          name: "Jane Smith",
          picture: "https://example.com/janesmith.jpg",
        },
        upvotes: 5,
        createdAt: new Date("2021-09-01T12:00:00.00Z"),
      },
      {
        _id: "ans2",
        content: "It helps catch errors early through static typing.",
        author: {
          _id: "a3",
          name: "Alice Brown",
          picture: "https://example.com/alicebrown.jpg",
        },
        upvotes: 3,
        createdAt: new Date("2021-09-02T12:00:00.00Z"),
      },
    ],
    createdAt: new Date("2021-09-01T12:00:00.00Z"),
  },
  {
    _id: "q2",
    title: "How does React work?",
    tags: [
      { _id: "t3", name: "React" },
      { _id: "t4", name: "Frontend" },
    ],
    author: {
      _id: "a4",
      name: "Mark Lee",
      picture: "https://example.com/marklee.jpg",
    },
    upvotes: 20,
    views: 35,
    answers: [
      {
        _id: "ans3",
        content: "React creates a virtual DOM to efficiently update the UI.",
        author: {
          _id: "a5",
          name: "Susan Wright",
          picture: "https://example.com/susanwright.jpg",
        },
        upvotes: 7,
        createdAt: new Date("2021-09-05T12:00:00.00Z"),
      },
    ],
    createdAt: new Date("2021-09-04T12:00:00.00Z"),
  },
];

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className=" mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />{" "}
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <HomeFilter />

      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a question"
          />
        )}
      </div>
    </>
  );
}
