"use client";

import Profile from "@/components/forms/Profile";

const ClientWrapper = ({
  clerkId,
  user,
}: {
  clerkId: string;
  user: string;
}) => {
  return <Profile clerkId={clerkId} user={user} />;
};

export default ClientWrapper;
