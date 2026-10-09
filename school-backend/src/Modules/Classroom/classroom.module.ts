import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service.js';
import { ClassroomController } from './classroom.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from '../../Database/Entities/classrooms.js';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
