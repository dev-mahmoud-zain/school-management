
import { Module } from '@nestjs/common';
import { ImportService } from './import.service.js';
import { ImportController } from './import.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../Database/Entities/teachers.js';
import { Classroom } from '../../Database/Entities/classrooms.js';
import { Student } from '../../Database/Entities/students.js';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Classroom, Student])],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
