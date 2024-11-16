import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import AnswerCard from "../card/AnswerCard";
import Pagination from "./Pagination";
import { Suspense } from "react";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({ searchParams, userId, clerkId }: Props) => {
  const awaitedSearchparams = await searchParams;
  const result = await getUserAnswers({
    userId,
    page: awaitedSearchparams.page ? +awaitedSearchparams.page : 1,
  });

  return (
    <>
      {result.answers.map((item) => (
        <AnswerCard
          key={item._id}
          clerkId={clerkId}
          _id={item._id}
          question={item.question}
          author={item.author}
          upvotes={item.upvotes.length}
          createdAt={item.createdAt}
        />
      ))}

      <div className="mt-10">
        <Suspense>
          <Pagination
            isNext={result.isNext}
            pageNumber={
              awaitedSearchparams?.page ? +awaitedSearchparams.page : 1
            }
          />
        </Suspense>
      </div>
    </>
  );
};

export default AnswersTab;
