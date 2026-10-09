import { z } from 'zod';
export const createCourseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  credits: z.number().int().positive().optional(),
});
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
