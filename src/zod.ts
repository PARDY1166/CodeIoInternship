import z from "zod";

export const dateCheck = z.object({
  date: z.string().date()
});