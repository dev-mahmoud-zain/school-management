
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../Database/Entities/students.js';
import { Classroom } from '../../Database/Entities/classrooms.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import type { UpdateStudentDto } from './dto/update-student.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class StudentService {
  private exceptionFactory = new ExceptionFactory();
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>
  ) {}

  async create(createDto: CreateStudentDto) {
    const existing = await this.studentRepo.findOne({ where: { email: createDto.email } });
    if (existing) throw this.exceptionFactory.conflict({ message: 'Student with this email already exists' });
    
    if (createDto.classroomId) {
      const classroom = await this.classroomRepo.findOne({ where: { id: createDto.classroomId } });
      if (!classroom) throw this.exceptionFactory.notFound({ message: 'Classroom not found' });
      
      const currentStudents = await this.studentRepo.count({ where: { classroom: { id: createDto.classroomId } } });
      if (currentStudents >= classroom.capacity) {
        throw this.exceptionFactory.badRequest({ message: 'Classroom is at full capacity' });
      }
    }

    const student = this.studentRepo.create({
      ...createDto,
      ...(createDto.classroomId && { classroom: { id: createDto.classroomId } })
    });
    return await this.studentRepo.save(student);
  }

  async findAll() {
    return await this.studentRepo.find({ relations: { classroom: true } });
  }

  async findOne(id: string) {
    const student = await this.studentRepo.findOne({ where: { id }, relations: { classroom: true } });
    if (!student) throw this.exceptionFactory.notFound({ message: 'Student not found' });
    return student;
  }

  async update(id: string, updateDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    
    if (updateDto.classroomId && student.classroom?.id !== updateDto.classroomId) {
      const classroom = await this.classroomRepo.findOne({ where: { id: updateDto.classroomId } });
      if (!classroom) throw this.exceptionFactory.notFound({ message: 'Classroom not found' });
      
      const currentStudents = await this.studentRepo.count({ where: { classroom: { id: updateDto.classroomId } } });
      if (currentStudents >= classroom.capacity) {
        throw this.exceptionFactory.badRequest({ message: 'Classroom is at full capacity' });
      }
      student.classroom = { id: updateDto.classroomId } as any;
    }

    if (updateDto.name !== undefined) student.name = updateDto.name;
    if (updateDto.email !== undefined) student.email = updateDto.email;
    if (updateDto.phone !== undefined) student.phone = updateDto.phone;

    return await this.studentRepo.save(student);
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.studentRepo.softRemove(student);
    return { id };
  }
}
