// import { z } from "zod/v3";

// // Base User schema for type definitions
// export const UserSchema = z.object({
//   fullName: z.string().min(3, "Full name must be at least 3 characters"),
//   email: z.string().email("Invalid email address"),
// phoneNumber: z
//   .string()
//   .min(10, "Phone must be at least 10 digits")
//   .max(15, "Phone cannot exceed 15 digits"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
//   role: z.enum(["user", "admin"]).default("user"),
// });

// // TypeScript type inferred from Zod schema
// export type UserType = z.infer<typeof UserSchema>;


import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone cannot exceed 15 digits"), 
  role: z.enum(["user", "admin"]).default("user"),
  imageUrl: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;