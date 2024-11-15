// For this file we're defining types we want our code to strictly obey.

import { BADGE_CRITERIA } from "@/constants";
export interface SidebarLink {
  imgURL: string;
  route: string;
  label: string;
}
export interface Job {
  id?: string;
  1;
  2;
  3;
  4;
  5;
  6;
  7;
  8;
  9;
  10;
  11;
  employer_name?: string;
  employer_logo?: string | undefined;
  employer_website?: string;
  job_employment_type?: string;
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
}
export interface Country {
  name: {
    common: string;
  };
}
export interface ParamsProps {
  params: Promise<{ id: string }>;
}

export interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// export interface SearchParamsProps {
//   searchParams: Record<string, string | undefined>;
// }

export interface URLProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
export interface BadgeCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}
export type BadgeCriteriaType = keyof typeof BADGE_CRITERIA;

export interface Theme {
  value: string;
  label: string;
  icon: string;
}
