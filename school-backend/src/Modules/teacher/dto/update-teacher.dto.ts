import { CreateTeacherDto } from './create-teacher.dto.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
