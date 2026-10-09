import { Module } from '@nestjs/common';
import { StudentService } from './student.service.js';
import { StudentController } from './student.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../Database/Entities/students.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
