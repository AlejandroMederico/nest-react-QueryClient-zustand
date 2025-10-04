import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ContentQuery {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit = 10;

  @IsOptional()
  @IsIn(['name', 'description', 'dateCreated'])
  sort: 'name' | 'description' | 'dateCreated' = 'dateCreated';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
