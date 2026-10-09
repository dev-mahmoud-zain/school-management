import { z } from 'zod';
export const createClassroomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  capacity: z.number().int().positive().optional(),
});
export type CreateClassroomDto = z.infer<typeof createClassroomSchema>;
