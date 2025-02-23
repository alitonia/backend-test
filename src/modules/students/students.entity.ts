import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Teacher } from '../teachers/teachers.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  isSuspended: boolean;

  @ManyToMany(() => Teacher, (teacher) => teacher.students)
  @JoinTable()
  teachers: Teacher[];
}
