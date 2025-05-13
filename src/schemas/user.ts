import { z } from "zod";

export const PersonalAccessTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  created_at: z.string().datetime(),
  // Add other fields as needed
});

export const UserSchema = z
  .object({
    id: z.number(),
    name: z.string().min(2).max(255),
    surname: z.string().min(2).max(255),
    email: z.string().email(),
    phone: z
      .string()
      .startsWith("+")
      .min(8)
      .max(16)
      .regex(
        /^\+\d+$/,
        "Phone number must start with '+' and be followed by digits"
      ),
    password: z.string().min(8).max(255).optional(),
    password_confirmation: z.string().optional(),
    // Add more fields according to your backend response

    city: z.string().optional().nullable(),
    languages: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    experiences: z.array(z.string()).optional(),
    external_review_url: z.string().url().optional().nullable(),
    referral_code: z.string().optional().nullable(),
  })
  .strict();

export const ConfirmPasswordStatusSchema = z.object({
  confirmed: z.boolean(),
});

export const ParsedCVSchema = z.object({
  parsed: z.any(), // Refine with actual shape if known
  text: z.string(),
});
