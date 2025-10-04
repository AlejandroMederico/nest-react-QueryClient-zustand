import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Course } from './course.entity';

export class CoursesListMetaDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class CoursesListResponseDto {
  @ApiProperty({ type: [Course] })
  data: Course[];

  @ApiProperty({ type: CoursesListMetaDto })
  meta: CoursesListMetaDto;
}

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
