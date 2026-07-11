import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export type LoginDto = z.infer<typeof loginSchema>;
