import { Injectable } from '@nestjs/common';
import { Student } from './students.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async findStudentByEmail(email: string): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { email: email } });
  }

  async getStudents(): Promise<Student[]> {
    return this.studentsRepository.find();
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const student = this.studentsRepository.create(studentData);
    return this.studentsRepository.save(student);
  }

  async save(student: Student) {
    return this.studentsRepository.save(student);
  }

  async getStudentById(id: number) {
    return this.studentsRepository.findOne({ where: { id: id } });
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await this.studentsRepository.delete({ id: id });
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
