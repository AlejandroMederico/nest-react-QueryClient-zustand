import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentQuery } from './content.query';

@Injectable()
export class ContentService {
  constructor(private readonly courseService: CourseService) {}

  async save(
    courseId: string,
    createContentDto: CreateContentDto,
  ): Promise<Content> {
    try {
      const { name, description } = createContentDto;
      const course = await this.courseService.findById(courseId);

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      return await Content.create({
        name,
        description,
        course,
        dateCreated: new Date(),
      }).save();
    } catch (error) {
      throw new HttpException(
        `ContentService.save: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(contentQuery: ContentQuery): Promise<Content[]> {
    try {
      Object.keys(contentQuery).forEach((key) => {
        contentQuery[key] = ILike(`%${contentQuery[key]}%`);
      });

      return await Content.find({
        where: contentQuery,
        order: {
          name: 'ASC',
          description: 'ASC',
        },
      });
    } catch (error) {
      throw new HttpException(
        `ContentService.findAll: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<Content> {
    try {
      const content = await Content.findOne(id);

      if (!content) {
        throw new HttpException(
          `Could not find content with matching id`,
          HttpStatus.NOT_FOUND,
        );
      }

      return content;
    } catch (error) {
      throw new HttpException(
        `ContentService.findById: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCourseIdAndId(courseId: string, id: string): Promise<Content> {
    try {
      const content = await Content.findOne({ where: { courseId, id } });
      if (!content) {
        throw new HttpException(
          `Could not find content with matching id`,
          HttpStatus.NOT_FOUND,
        );
      }
      return content;
    } catch (error) {
      throw new HttpException(
        `ContentService.findByCourseIdAndId: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByCourseId(
    courseId: string,
    contentQuery: ContentQuery,
  ): Promise<Content[]> {
    try {
      Object.keys(contentQuery).forEach((key) => {
        contentQuery[key] = ILike(`%${contentQuery[key]}%`);
      });
      return await Content.find({
        where: { courseId, ...contentQuery },
        order: {
          name: 'ASC',
          description: 'ASC',
        },
      });
    } catch (error) {
      throw new HttpException(
        `ContentService.findAllByCourseId: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    courseId: string,
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    try {
      const content = await this.findByCourseIdAndId(courseId, id);

      if (!content) {
        throw new HttpException(
          `Could not find content with matching id `,
          HttpStatus.NOT_FOUND,
        );
      }
      return await Content.create({
        id: content.id,
        ...updateContentDto,
      }).save();
    } catch (error) {
      throw new HttpException(
        `ContentService.update: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(courseId: string, id: string): Promise<string> {
    try {
      const content = await this.findByCourseIdAndId(courseId, id);
      if (!content) {
        throw new HttpException(
          `Could not find content with matching id `,
          HttpStatus.NOT_FOUND,
        );
      }
      await Content.delete(content);
      return id;
    } catch (error) {
      throw new HttpException(
        `ContentService.delete: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await Content.count();
    } catch (error) {
      throw new HttpException(
        `ContentService.count: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
