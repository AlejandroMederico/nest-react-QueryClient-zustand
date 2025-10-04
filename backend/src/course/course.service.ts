import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';

@Injectable()
export class CourseService {
  async save(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      return await Course.create({
        ...createCourseDto,
        dateCreated: new Date(),
      }).save();
    } catch (error) {
      throw new HttpException(
        `CourseService.save: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(dto: CourseQuery) {
    try {
      const { page, limit, sort, order, name, description } = dto;
      const qb = Course.createQueryBuilder('c');
      if (name) {
        qb.andWhere('c.name ILIKE :name', { name: `%${name}%` });
      }
      if (description) {
        qb.andWhere('c.description ILIKE :description', {
          description: `%${description}%`,
        });
      }
      const sortColumn = sort ?? 'c.dateCreated';
      const sortOrder = (order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
      qb.orderBy(`c.${sortColumn}`, sortOrder);
      const skip = (page - 1) * limit;
      qb.skip(skip).take(limit);
      const [rows, total] = await qb.getManyAndCount();
      return {
        data: rows,
        meta: { page, limit, total },
      };
    } catch (error) {
      throw new HttpException(
        `CourseService.findAll: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<Course> {
    try {
      const course = await Course.findOne(id);
      if (!course) {
        throw new HttpException(
          `Could not find course with matching id ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return course;
    } catch (error) {
      throw new HttpException(
        `CourseService.findById: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    try {
      const course = await this.findById(id);
      return await Course.create({ id: course.id, ...updateCourseDto }).save();
    } catch (error) {
      throw new HttpException(
        `CourseService.update: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<string> {
    try {
      const course = await this.findById(id);
      await Course.delete(course);
      return id;
    } catch (error) {
      throw new HttpException(
        `CourseService.delete: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await Course.count();
    } catch (error) {
      throw new HttpException(
        `CourseService.count: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
