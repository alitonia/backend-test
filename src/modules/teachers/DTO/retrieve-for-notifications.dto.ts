import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class RetrieveForNotificationsDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Teacher email is required' })
  teacher: string;

  @IsString({ message: 'Notification must be a string' })
  @IsNotEmpty({ message: 'Notification is required' })
  notification: string;
}
