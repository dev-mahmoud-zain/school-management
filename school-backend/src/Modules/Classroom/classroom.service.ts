import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../../Database/Entities/classrooms.js';
import type { CreateClassroomDto } from './dto/create-classroom.dto.js';
import type { UpdateClassroomDto } from './dto/update-classroom.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class ClassroomService {
  private exceptionFactory = new ExceptionFactory();
  constructor(@InjectRepository(Classroom) private classroomRepo: Repository<Classroom>) {}

  async create(createDto: CreateClassroomDto) {
    const existing = await this.classroomRepo.findOne({ where: { roomNumber: createDto.roomNumber } });
    if (existing) throw this.exceptionFactory.conflict({ message: 'Classroom with this room number already exists' });
    const classroom = this.classroomRepo.create(createDto);
    return await this.classroomRepo.save(classroom);
  }

  async findAll() {
    return await this.classroomRepo.find({ relations: { courses: true } });
  }

  async findOne(id: string) {
    const classroom = await this.classroomRepo.findOne({ where: { id }, relations: { courses: true } });
    if (!classroom) throw this.exceptionFactory.notFound({ message: 'Classroom not found' });
    return classroom;
  }

  async update(id: string, updateDto: UpdateClassroomDto) {
    const classroom = await this.findOne(id);
    Object.assign(classroom, updateDto);
    return await this.classroomRepo.save(classroom);
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);
    await this.classroomRepo.softRemove(classroom);
    return { id };
  }
}
