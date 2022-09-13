import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export class PaginationParams {
  @IsNumber()
  page = 1;

  @IsNumber()
  per_page = 10;

  @IsString()
  @IsOptional()
  sort_by: string;

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sort_order: 'DESC' | 'ASC';

  @IsString()
  @IsOptional()
  q: string;
}

interface IsFileOptions {
  mime: ('image/jpg' | 'image/png' | 'image/jpeg')[];
}

export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    return registerDecorator({
      name: 'isFile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (
            value?.mimetype &&
            (options?.mime ?? []).includes(value?.mimetype)
          ) {
            return true;
          }
          return false;
        },
      },
    });
  };
}
