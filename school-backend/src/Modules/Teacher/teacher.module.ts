import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { TeacherController } from './teacher.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../Database/Entities/teachers.js';
import { Classroom } from '../../Database/Entities/classrooms.js';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Classroom])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
