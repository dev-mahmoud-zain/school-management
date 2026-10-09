import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseModel } from './base.model.js';
import { Course } from './courses.js';

@Entity('classrooms')
export class Classroom extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  roomNumber: string;

  @Column({ default: 30 })
  capacity: number;

  @OneToMany(() => Course, (course) => course.classroom)
  courses: Relation<Course[]>;
}
