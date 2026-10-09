import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseModel } from './base.model.js';
import { Course } from './courses.js';

@Entity('teachers')
export class Teacher extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Relation<Course[]>;
}
