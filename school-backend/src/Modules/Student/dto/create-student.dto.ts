import { z } from 'zod';
export const createStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});
export type CreateStudentDto = z.infer<typeof createStudentSchema>;
