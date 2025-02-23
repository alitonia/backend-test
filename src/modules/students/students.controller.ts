import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './students.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  getStudents(): Promise<Student[]> {
    return this.studentsService.getStudents();
  }

  @Get(':id')
  async getStudentById(@Param('id') id: number): Promise<Student> {
    const student = await this.studentsService.getStudentById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStudent(@Param('id') id: number): Promise<void> {
    const result = await this.studentsService.deleteStudent(id);
    if (!result) {
      throw new NotFoundException('Student not found');
    }
  }
}
