import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import Loading from "../[id]/loading";

const page = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const mongoUser = await getUserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-9">
        <Suspense fallback={<Loading />}>
          <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
