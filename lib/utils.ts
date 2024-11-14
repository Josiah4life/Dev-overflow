import { clsx, type ClassValue } from "clsx";
// import { create } from "domain";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constant";
import { BadgeCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimestamp = (createdAt: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
  let interval = seconds / 31536000; // 60 * 60 * 24 * 365

  if (interval >= 1) {
    return `${Math.floor(interval)} year${
      Math.floor(interval) > 1 ? "s" : ""
    } ago`;
  }
  interval = seconds / 2592000; // 60 * 60 * 24 * 30
  if (interval >= 1) {
    return `${Math.floor(interval)} month${
      Math.floor(interval) > 1 ? "s" : ""
    } ago`;
  }
  interval = seconds / 86400; // 60 * 60 * 24
  if (interval >= 1) {
    return `${Math.floor(interval)} day${
      Math.floor(interval) > 1 ? "s" : ""
    } ago`;
  }
  interval = seconds / 3600; // 60 * 60
  if (interval >= 1) {
    return `${Math.floor(interval)} hour${
      Math.floor(interval) > 1 ? "s" : ""
    } ago`;
  }
  interval = seconds / 60; // 60
  if (interval >= 1) {
    return `${Math.floor(interval)} minute${
      Math.floor(interval) > 1 ? "s" : ""
    } ago`;
  }
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
};

export const formatBigNumber = (num: number): string => {
  if (isNaN(num) || num === undefined || num === null) {
    return "0"; // Or handle the error as needed
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
};

export function formatJoinDate(date: Date): string {
  // Check if the input is a valid Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }

  // Define options for month and year formatting
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  // Format the date to a readable string
  return date.toLocaleDateString("en-US", options);
}

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}
export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}

export const assignBadges = (params: BadgeParam) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  return badgeCounts;
};
