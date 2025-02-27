import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { Teacher } from './teachers.entity';
import { AssignStudentsDto } from './DTO/assign-students.dto';
import { StudentsService } from '../students/students.service';
import { RetrieveForNotificationsDto } from './DTO/retrieve-for-notifications.dto';
import { SuspendStudentDto } from './DTO/suspend-student.dto';
import { EmailValidationPipe } from './DTO/email-validation.pipe';

@Controller()
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get('teachers')
  getTeachers(): Promise<Teacher[]> {
    return this.teachersService.getTeachers();
  }

  @Get('teachers/:teacherId')
  getTeacherById(@Param('teacherId') teacherId: number): Promise<Teacher> {
    return this.teachersService.getTeacherById(teacherId);
  }

  @Post('teachers')
  createTeacher(@Body() teacherData: Partial<Teacher>): Promise<Teacher> {
    return this.teachersService.createTeacher(teacherData);
  }

  @Post('teachers/:teacherId/assign/:studentId')
  assignStudentToTeacher(
    @Param('teacherId') teacherId: number,
    @Param('studentId') studentId: number,
  ): Promise<Teacher> {
    return this.teachersService.assignStudentToTeacher(teacherId, studentId);
  }

  // @Post('teachers/assign')
  @Post('api/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignStudentsToTeacher(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    assignData: AssignStudentsDto,
  ): Promise<void> {
    try {
      await this.teachersService.assignStudentsToTeacher(
        assignData.teacher,
        assignData.students,
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Teacher not found') {
        throw new NotFoundException('Teacher not found');
      }
      throw new BadRequestException('Failed to assign students to teacher');
    }
  }

  // @Get('teachers/commonstudents')
  @Get('api/commonstudents')
  async getCommonStudents(
    @Query('teacher', new EmailValidationPipe()) teachers: string | string[],
  ): Promise<{ students: string[] }> {
    if (!teachers) {
      return { students: [] };
    }
    const teacherEmails = Array.isArray(teachers) ? teachers : [teachers];
    const commonStudents =
      await this.teachersService.getCommonStudentsRaw(teacherEmails);

    return { students: commonStudents.map((student) => student.email) };
  }

  // @Post('teachers/suspend')
  @Post('api/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendStudent(
    @Body(new ValidationPipe({ transform: true })) dto: SuspendStudentDto,
  ): Promise<void> {
    const student = await this.studentsService.findStudentByEmail(dto.student);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    student.isSuspended = true;
    try {
      await this.studentsService.save(student);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to suspend student');
    }
  }

  // @Post('teachers/retrievefornotifications')
  @Post('/api/retrievefornotifications')
  @HttpCode(HttpStatus.OK)
  async retrieveForNotifications(
    @Body(new ValidationPipe({ transform: true }))
    dto: RetrieveForNotificationsDto,
  ): Promise<{ recipients: string[] }> {
    const students = await this.teachersService.retrieveForNotifications(
      dto.teacher,
      dto.notification,
    );
    return { recipients: students.map((student) => student.email) };
  }
}
