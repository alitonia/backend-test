import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './teachers.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
  ) {}

  async getTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find();
  }

  async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.teachersRepository.create(teacherData);
    return this.teachersRepository.save(teacher);
  }

  async assignStudentToTeacher(teacherId: number, studentId: number): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    teacher.students = [...teacher.students, { id: studentId } as any];
    return this.teachersRepository.save(teacher);
  }
}