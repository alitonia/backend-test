import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Teacher } from '../../src/modules/teachers/teachers.entity';
import { Student } from '../../src/modules/students/students.entity';

describe('TeachersController (e2e)', () => {
  let app: INestApplication;
  let mockTeacherRepository;
  let mockStudentRepository;

  beforeEach(async () => {
    mockTeacherRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockStudentRepository = {
      find: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Teacher))
      .useValue(mockTeacherRepository)
      .overrideProvider(getRepositoryToken(Student))
      .useValue(mockStudentRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/register (POST)', async () => {
    const teacherEmail = 'teacherken@gmail.com';
    const studentEmails = ['studentjon@gmail.com', 'studenthon@gmail.com'];

    mockTeacherRepository.findOne.mockResolvedValue({
      id: 1,
      email: teacherEmail,
      students: [],
    });
    mockStudentRepository.find.mockResolvedValue(
      studentEmails.map((email, index) => ({ id: index + 1, email })),
    );
    mockTeacherRepository.save.mockImplementation((input) => input);

    return request(app.getHttpServer())
      .post('/api/register')
      .send({
        teacher: teacherEmail,
        students: studentEmails,
      })
      .expect(204)
      .then(() => {
        expect(mockTeacherRepository.findOne).toHaveBeenCalled();
        expect(mockStudentRepository.find).toHaveBeenCalled();
        expect(mockTeacherRepository.save).toHaveBeenCalled();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
