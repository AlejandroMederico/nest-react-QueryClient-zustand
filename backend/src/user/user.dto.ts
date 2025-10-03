import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  password: string;

  @IsEnum(Role)
  role: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsAlphanumeric()
  username?: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;
}

export class UsersListQueryDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  q?: string;

  @Transform(({ value }) => {
    if (value === '' || value === 'all') return undefined;
    return value;
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsInt()
  @Min(1)
  limit = 10;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsIn(['username', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'])
  sort:
    | 'username'
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'isActive'
    | 'createdAt' = 'createdAt';

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}

export class UserSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() username: string;
  @ApiProperty({ enum: ['admin', 'editor', 'user'] })
  role: 'admin' | 'editor' | 'user';
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class UsersListMetaDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  data: UserSummaryDto[];

  @ApiProperty({ type: UsersListMetaDto })
  meta: UsersListMetaDto;
}
