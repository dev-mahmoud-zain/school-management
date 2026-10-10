import { z } from 'zod';
export const createClassroomSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  capacity: z.number().int().positive().optional(),
  teacherId: z.string().uuid("Invalid teacher ID").optional(),
});
export type CreateClassroomDto = z.infer<typeof createClassroomSchema>;
