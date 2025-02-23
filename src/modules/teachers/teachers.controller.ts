import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { Teacher } from './teachers.entity';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {
  }

  @Get()
  getTeachers(): Promise<Teacher[]> {
    return this.teachersService.getTeachers();
  }

  @Post()
  createTeacher(@Body() teacherData: Partial<Teacher>): Promise<Teacher> {
    return this.teachersService.createTeacher(teacherData);
  }

  @Post(':teacherId/assign/:studentId')
  assignStudentToTeacher(
    @Param('teacherId') teacherId: number,
    @Param('studentId') studentId: number,
  ): Promise<Teacher> {
    return this.teachersService.assignStudentToTeacher(teacherId, studentId);
  }
}