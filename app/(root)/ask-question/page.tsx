import Question from "@/components/forms/Question";
import { redirect } from "next/navigation";
import React from "react";

import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId } = auth();

  // const userId = "clerk_123456";

  if (!userId) redirect("/sign-in");

  if (!userId) {
    console.log("No user found with this clerkId");
    throw new Error(" User not found");
  }

  const mongoUser = await getUserById({
    userId,
  });

  console.log(mongoUser);

  if (!mongoUser) {
    console.log("User not found Mongo");
  } else {
    console.log(mongoUser);
  }

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>
      <div className="mt-9 ">
        <Question mongoUserId={JSON.stringify(mongoUser._id)} />
      </div>
    </div>
  );
};

export default Page;
