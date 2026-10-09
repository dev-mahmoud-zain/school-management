import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { BaseModel } from './base.model.js';

@Entity('classrooms')
export class Classroom extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  roomNumber: string;

  @Column({ default: 30 })
  capacity: number;
}
