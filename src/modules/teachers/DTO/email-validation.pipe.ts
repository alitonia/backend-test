import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class EmailValidationPipe implements PipeTransform {
  transform(value: any) {
    if (Array.isArray(value)) {
      if (!value.every((email) => isEmail(email))) {
        throw new BadRequestException('Invalid email format in the array');
      }
    } else if (typeof value === 'string') {
      if (!isEmail(value)) {
        throw new BadRequestException('Invalid email format');
      }
    } else {
      throw new BadRequestException('Invalid input');
    }
    return value;
  }
}
