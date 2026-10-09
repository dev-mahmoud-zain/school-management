import { createClassroomSchema } from './create-classroom.dto.js';
import type { z } from 'zod';
export const updateClassroomSchema = createClassroomSchema.partial();
export type UpdateClassroomDto = z.infer<typeof updateClassroomSchema>;
