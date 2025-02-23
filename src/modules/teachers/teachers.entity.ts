import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
// import { Student } from '../students/students.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  subject: string;

  // @ManyToMany(() => Student, student => student.teachers)
  // students: Student[];
}