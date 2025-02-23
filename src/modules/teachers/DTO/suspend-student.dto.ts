import { IsEmail, IsNotEmpty } from 'class-validator';

export class SuspendStudentDto {
  @IsEmail({}, { message: 'Invalid student email format' })
  @IsNotEmpty({ message: 'Student email is required' })
  student: string;
}
