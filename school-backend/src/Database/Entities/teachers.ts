
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseModel } from './base.model.js';
import { Classroom } from './classrooms.js';

@Entity('teachers')
export class Teacher extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @OneToMany(() => Classroom, (classroom) => classroom.teacher)
  classrooms: Relation<Classroom[]>;
}
