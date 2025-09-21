import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

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
        `An error occurred in CourseService.save: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(courseQuery: CourseQuery): Promise<Course[]> {
    try {
      Object.keys(courseQuery).forEach((key) => {
        courseQuery[key] = ILike(`%${courseQuery[key]}%`);
      });
      return await Course.find({
        where: courseQuery,
        order: {
          name: 'ASC',
          description: 'ASC',
        },
      });
    } catch (error) {
      throw new HttpException(
        `An error occurred in CourseService.findAll: ${error.message}`,
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
        `An error occurred in CourseService.findById: ${error.message}`,
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
        `An error occurred in CourseService.update: ${error.message}`,
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
        `An error occurred in CourseService.delete: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await Course.count();
    } catch (error) {
      throw new HttpException(
        `An error occurred in CourseService.count: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
