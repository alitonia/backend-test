import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource, In } from 'typeorm';
import { Teacher } from '../src/modules/teachers/teachers.entity';
import { Student } from '../src/modules/students/students.entity';

async function getDataSource() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'edu_backend',
    entities: [Student, Teacher],
    synchronize: true, // Set to false in production
  });
  await dataSource.initialize();
  return dataSource;
}

async function clearDatabase(dataSource: DataSource) {
  await dataSource.query('DELETE FROM student');
  await dataSource.query('DELETE FROM teacher');
  await dataSource.query('ALTER TABLE student AUTO_INCREMENT = 1');
  await dataSource.query('ALTER TABLE teacher AUTO_INCREMENT = 1');
}

async function populateFakeData() {
  const dataSource = await getDataSource();

  await clearDatabase(dataSource);
  // insert teachers
  await dataSource.manager.save(Teacher, [
    {
      firstName: 'Teacher',
      lastName: '1',
      email: 'teacher_1@example.com',
      subject: 'Math',
    },
    {
      firstName: 'Teacher',
      lastName: '2',
      email: 'teacher_2@example.com',
      subject: 'Science',
    },
    {
      firstName: 'Teacher',
      lastName: '3',
      email: 'teacher_3@example.com',
      subject: 'Science',
    },
  ]);

  // insert students
  await dataSource.manager.save(Student, [
    {
      firstName: 'Student',
      lastName: '1',
      email: 'student_1@example.com',
      isSuspended: false,
    },
    {
      firstName: 'Student',
      lastName: '2',
      email: 'student_2@example.com',
      isSuspended: false,
    },
    {
      firstName: 'Student',
      lastName: '3',
      email: 'student_3@example.com',
      isSuspended: true,
    },
  ]);

  await dataSource.destroy();
  return null;
}

describe('TeacherController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await populateFakeData();
  });

  afterAll(async () => {
    await app.close();
  });

  //   1. Test register students to teacher api
  it('should register students to teacher', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/register')
      .send({
        teacher: 'teacher_1@example.com',
        students: ['student_1@example.com', 'student_3@example.com'],
      });

    expect(res.status).toBe(204);
    // test data in relation table
    const dataSource = await getDataSource();
    const teachers = await dataSource.manager.find(Teacher, {
      where: { email: 'teacher_1@example.com' },
      relations: ['students'],
    });
    const studentEmails = teachers[0].students.map((s: Student) => s.email);
    expect(studentEmails).toContain('student_1@example.com');
    expect(studentEmails).toContain('student_3@example.com');
    await dataSource.destroy();
  });
  //   2. Test common students api
  it('should get common students', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/api/register')
      .send({
        teacher: 'teacher_1@example.com',
        students: ['student_1@example.com', 'student_3@example.com'],
      });

    expect(res1.status).toBe(204);

    const res2 = await request(app.getHttpServer())
      .post('/api/register')
      .send({
        teacher: 'teacher_2@example.com',
        students: ['student_1@example.com', 'student_2@example.com'],
      });

    expect(res2.status).toBe(204);

    const res = await request(app.getHttpServer()).get(
      '/api/commonstudents?teacher=teacher_1@example.com&teacher=teacher_2@example.com',
    );

    expect(res.status).toBe(200);
    console.log(res.body);
    expect(res.body).toEqual({ students: ['student_1@example.com'] });
  });

  //   3. Test suspend student api
  it('should suspend student', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/suspend')
      .send({ student: 'student_1@example.com' });

    expect(res.status).toBe(204);

    const dataSource = await getDataSource();
    const student = await dataSource.manager.findOne(Student, {
      where: { email: 'student_1@example.com' },
    });
    expect(student?.isSuspended).toBe(true);
    await dataSource.destroy();
  });
  it('suspend suspended student', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/suspend')
      .send({ student: 'student_3@example.com' });

    expect(res.status).toBe(204);

    const dataSource = await getDataSource();
    const student = await dataSource.manager.findOne(Student, {
      where: { email: 'student_3@example.com' },
    });
    expect(student?.isSuspended).toBe(true);
    await dataSource.destroy();
  });

  //   4. Test retrieve for notifications api
  it('should retrieve notifications of empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'teacher_1@example.com',
        notification: 'Hello',
      })
      .expect(200);

    expect(res.body).toEqual({
      recipients: [],
    });
  });
  it('should retrieve notifications for students with relation to teacher', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/api/register')
      .send({
        teacher: 'teacher_1@example.com',
        students: ['student_1@example.com', 'student_3@example.com'],
      });

    expect(res1.status).toBe(204);

    const res = await request(app.getHttpServer())
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'teacher_1@example.com',
        notification: 'Hello',
      })
      .expect(200);

    expect(res.body).toEqual({
      recipients: ['student_1@example.com'],
    });
  });

  it('should retrieve notifications for students with mentions', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'teacher_1@example.com',
        notification: 'Hello @student_1@example.com, @student_3@example.com',
      })
      .expect(200);

    expect(res.body).toEqual({
      recipients: ['student_1@example.com'],
    });
  });
  it('should not retrieve notifications for fake mentions', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'teacher_1@example.com',
        notification: 'Hello @lulo@example.com, @pika',
      })
      .expect(200);

    expect(res.body).toEqual({
      recipients: [],
    });
  });
});
