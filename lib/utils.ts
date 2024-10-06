import { clsx, type ClassValue } from "clsx";
import { create } from "domain";
import { twMerge } from "tailwind-merge";

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

// Example usage:
console.log(getTimestamp(new Date("2024-10-01T12:00:00.00Z"))); // Output will vary depending on the current date

export const formatBigNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`; // Divide by 1,000,000 for millions
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`; // Divide by 1,000 for thousands
  }
  return num.toString(); // Return the number as a string if it's less than 1,000
};
