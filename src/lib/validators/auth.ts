import * as z from "zod";

export const authSchema = z.object({
  name: z.string().min(1),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(100, {
      message: "Password must be at most 100 characters long",
    }),
  emailVerified: z.date(),
  image: z.string(),
});
