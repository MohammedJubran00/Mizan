import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string({ error: 'Full name is required.' })
    .trim()
    .min(1, 'Full name is required.')
    .max(120, 'Full name must be at most 120 characters.'),
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
