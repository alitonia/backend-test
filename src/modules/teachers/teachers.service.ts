import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Teacher } from './teachers.entity';
import { Student } from '../students/students.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async getTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find();
  }

  async getTeacherById(teacherId: number): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return teacher;
  }

  async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.teachersRepository.create(teacherData);
    return this.teachersRepository.save(teacher);
  }

  async assignStudentToTeacher(
    teacherId: number,
    studentId: number,
  ): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    teacher.students = [...teacher.students, { id: studentId } as Student];
    return this.teachersRepository.save(teacher);
  }

  async assignStudentsToTeacher(
    teacherEmail: string,
    studentEmails: string[],
  ): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { email: teacherEmail },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const students = await this.studentsRepository.find({
      where: { email: In(studentEmails) },
    });

    teacher.students = [...teacher.students];
    for (const student of students) {
      if (!teacher.students.find((s) => s.id === student.id)) {
        teacher.students.push(student);
      }
    }
    try {
      return this.teachersRepository.save(teacher);
    } catch (e) {
      console.error('Error saving teacher', e);
      throw new BadRequestException('Failed to assign students to teacher');
    }
  }

  async getCommonStudents(teacherEmails: string[]): Promise<Student[]> {
    const teachers = await this.teachersRepository.find({
      where: { email: In(teacherEmails) },
      relations: ['students'],
    });
    if (teachers.length === 0) {
      return [];
    }

    let commonStudents = teachers[0].students;
    for (let i = 1; i < teachers.length; i++) {
      const teacherStudents = teachers[i].students;
      commonStudents = commonStudents.filter((student) =>
        teacherStudents.some((s) => s.id === student.id),
      );
    }

    return commonStudents;
  }

  async getCommonStudentsRaw(teacherEmails: string[]): Promise<Student[]> {
    const query = `
      SELECT s.*
      FROM student s
      JOIN student_teachers_teacher ts ON s.id = ts.studentId
      JOIN teacher t ON t.id = ts.teacherId
      WHERE t.email IN (${teacherEmails.map((email) => `'${email}'`).join(', ')})
      GROUP BY s.id
      HAVING COUNT(DISTINCT t.id) = ${teacherEmails.length}
    `;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const students: Student[] = await this.studentsRepository.query(
        query,
        [],
      );
      return students.map((student: Student) =>
        this.studentsRepository.create(student),
      );
    } catch (e) {
      throw new BadRequestException('Failed to retrieve common students');
    }
  }

  async retrieveForNotifications(
    teacherEmail: string,
    notificationText: string,
  ) {
    const listOfMentionedStudents =
      notificationText.match(/@[\w-.]+@([\w-]+\.)+[\w-]{2,4}/g) || [];

    let query = `
    SELECT s.*
    FROM student s
    JOIN student_teachers_teacher ts ON s.id = ts.studentId
    JOIN teacher t ON t.id = ts.teacherId
    WHERE t.email = "${teacherEmail}"
    AND s.isSuspended = false

    `;
    if (listOfMentionedStudents.length > 0) {
      query += `
          UNION
          SELECT s.*
          FROM student s
          WHERE s.email IN (${listOfMentionedStudents.map((email: string) => `'${email.substring(1)}'`).join(', ')})
          AND s.isSuspended = false
      `;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const students: Student[] = await this.studentsRepository.query(
        query,
        [],
      );

      return students.map((student: Student) =>
        this.studentsRepository.create(student),
      );
    } catch (e) {
      console.error('Error retrieving students for notifications', e);
      throw new BadRequestException(
        'Failed to retrieve students for notifications',
      );
    }
  }
}
