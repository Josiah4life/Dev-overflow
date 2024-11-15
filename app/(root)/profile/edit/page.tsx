import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const page = async () => {
  try {
    const { userId } = await auth();

    if (!userId) return <div>User not authenticated</div>;

    const mongoUser = await getUserById({ userId });

    return (
      <>
        <div>
          <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

          <div className="mt-9">
            <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in page:", error);
    return <div>Something went wrong</div>;
  }
};

export default page;
