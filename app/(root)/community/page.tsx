import LocalSearch from "@/components/shared/navbar/search/LocalSearch";
import { UserFilters } from "@/constant/filter";
import Filter from "@/components/shared/Filter";
import { getAllUsers } from "@/lib/actions/user.action";
import Link from "next/link";
import UserCard from "@/components/card/UserCard";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";

import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
export const metadata: Metadata = {
  title: "Community | Dev Overflow",
};

const Page = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const result = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <Suspense fallback={<Loading />}>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <div className=" mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/community"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for aamazing minds"
          otherClasses="flex-1"
        />{" "}
        <Filter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <section className="m-12 flex flex-wrap gap-4">
        {result.users.length > 0 ? (
          result.users.map((user) => <UserCard key={user._id} user={user} />)
        ) : (
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            <p>No users yet</p>
            <Link href="/signup" className="mt-2 font-bold text-accent-blue">
              Join to be the first!
            </Link>
          </div>
        )}
      </section>

      <div className="mt-10">
        <Suspense>
          <Pagination
            pageNumber={searchParams?.page ? +searchParams.page : 1}
            isNext={result.isNext}
          />
        </Suspense>
      </div>
    </Suspense>
  );
};

export default Page;
