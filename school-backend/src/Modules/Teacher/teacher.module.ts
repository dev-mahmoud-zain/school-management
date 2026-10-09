import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { TeacherController } from './teacher.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../Database/Entities/teachers.js';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
