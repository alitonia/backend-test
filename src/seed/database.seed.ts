import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StudentsService } from '../modules/students/students.service';
import { Student } from '../modules/students/students.entity';
import { TeachersService } from '../modules/teachers/teachers.service';

const RECORDS_COUNT = 100;
const TEACHER_COUNT = 30;

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const studentsService = app.get(StudentsService);
  const teachersService = app.get(TeachersService);

  const fakeStudents = Array.from({ length: RECORDS_COUNT }, (_, index) => ({
    firstName: `firstName_${index}`,
    lastName: `lastName_${index}`,
    email: `fake_${index}@example.com`,
  }));

  const createdStudents: Student[] = [];
  for (const student of fakeStudents) {
    const createdStudent = await studentsService.createStudent(student);
    createdStudents.push(createdStudent);
  }

  // Create teachers with random students
  const subjects = ['Math', 'Science', 'History', 'English', 'Art'];
  const fakeTeachers = Array.from({ length: TEACHER_COUNT }, (_, index) => ({
    firstName: `Teacher_${index}`,
    lastName: `LastName_${index}`,
    email: `teacher_${index + 1}@example.com`,
    subject: subjects[index % subjects.length],
  }));

  for (const teacher of fakeTeachers) {
    const createdTeacher = await teachersService.createTeacher(teacher);

    const randomStudents = createdStudents
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1);

    for (const student of randomStudents) {
      await teachersService.assignStudentToTeacher(
        createdTeacher.id,
        student.id,
      );
    }
  }
  await app.close();
}

bootstrap();
