import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

export const formQuestionSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});
