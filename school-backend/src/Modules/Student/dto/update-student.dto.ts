import { createStudentSchema } from './create-student.dto.js';
import type { z } from 'zod';
export const updateStudentSchema = createStudentSchema.partial();
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
