import { createCourseSchema } from './create-course.dto.js';
import type { z } from 'zod';
export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
