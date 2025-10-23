import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || this.isPrimitive(metatype) || value === null || value === undefined) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    sanitize(object);

    return object;
  }

  private isPrimitive(metatype: unknown): boolean {
    const types: Array<Function> = [String, Boolean, Number, Array, Object];
    return !!types.find((type) => metatype === type);
  }
}
