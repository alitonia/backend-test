import { IsEmail, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class AssignStudentsDto {
  @IsNotEmpty()
  @IsEmail()
  teacher: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  students: string[];
}