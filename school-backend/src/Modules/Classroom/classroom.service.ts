
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../../Database/Entities/classrooms.js';
import { Teacher } from '../../Database/Entities/teachers.js';
import { Student } from '../../Database/Entities/students.js';
import type { CreateClassroomDto } from './dto/create-classroom.dto.js';
import type { UpdateClassroomDto } from './dto/update-classroom.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class ClassroomService {
  private exceptionFactory = new ExceptionFactory();
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
    @InjectRepository(Student) private studentRepo: Repository<Student>
  ) {}

  async create(createDto: CreateClassroomDto) {
    const existing = await this.classroomRepo.findOne({ where: { name: createDto.name } });
    if (existing) throw this.exceptionFactory.conflict({ message: 'Classroom with this name already exists' });
    
    if (createDto.teacherId) {
      const teacherExists = await this.teacherRepo.count({ where: { id: createDto.teacherId } });
      if (!teacherExists) throw this.exceptionFactory.notFound({ message: 'Teacher not found' });
    }

    const classroom = this.classroomRepo.create({
      ...createDto,
      ...(createDto.teacherId && { teacher: { id: createDto.teacherId } }),
    });
    return await this.classroomRepo.save(classroom);
  }

  async findAll() {
    return await this.classroomRepo.find({ relations: { teacher: true, students: true } });
  }

  async findOne(id: string) {
    const classroom = await this.classroomRepo.findOne({ where: { id }, relations: { teacher: true, students: true } });
    if (!classroom) throw this.exceptionFactory.notFound({ message: 'Classroom not found' });
    return classroom;
  }

  async update(id: string, updateDto: UpdateClassroomDto) {
    const classroom = await this.findOne(id);
    
    if (updateDto.teacherId) {
      const teacherExists = await this.teacherRepo.count({ where: { id: updateDto.teacherId } });
      if (!teacherExists) throw this.exceptionFactory.notFound({ message: 'Teacher not found' });
      classroom.teacher = { id: updateDto.teacherId } as any;
    }

    if (updateDto.capacity !== undefined) {
      const studentCount = await this.studentRepo.count({ where: { classroom: { id } } });
      if (updateDto.capacity < studentCount) {
        throw this.exceptionFactory.badRequest({ message: 'Cannot reduce capacity below current number of students' });
      }
      classroom.capacity = updateDto.capacity;
    }

    if (updateDto.name !== undefined) classroom.name = updateDto.name;
    
    return await this.classroomRepo.save(classroom);
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);
    const studentCount = await this.studentRepo.count({ where: { classroom: { id } } });
    
    if (studentCount > 0) {
      throw this.exceptionFactory.conflict({ message: 'Cannot delete classroom with enrolled students' });
    }
    
    await this.classroomRepo.softRemove(classroom);
    return { id };
  }
}
