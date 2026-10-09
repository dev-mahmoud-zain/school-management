import { createTeacherSchema } from './create-teacher.dto.js';
import type { z } from 'zod';

// Make all fields optional for updates
export const updateTeacherSchema = createTeacherSchema.partial();

export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
