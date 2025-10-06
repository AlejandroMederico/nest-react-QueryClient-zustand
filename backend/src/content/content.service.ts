import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ILike } from 'typeorm';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentQuery } from './content.query';

@Injectable()
export class ContentService {
  constructor(private readonly courseService: CourseService) {}

  async findLatestWithCourse(limit = 5): Promise<Content[]> {
    try {
      return await Content.find({
        relations: ['course'],
        order: { dateCreated: 'DESC' },
        take: limit,
      });
    } catch (error) {
      throw new HttpException(
        `ContentService.findLatestWithCourse: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async save(
    courseId: string,
    createContentDto: CreateContentDto,
    image?: Express.Multer.File,
  ): Promise<Content> {
    try {
      const { name, description } = createContentDto;
      const course = await this.courseService.findById(courseId);

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      const content = await Content.create({
        name,
        description,
        course,
        dateCreated: new Date(),
      }).save();

      let imageUrl: string | undefined = undefined;
      if (image) {
        const uploadDir = path.resolve(__dirname, '../../shared/upload');
        const ext = path.extname(image.originalname) || '.jpg';
        const dest = path.join(uploadDir, `${content.id}${ext}`);
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        if (image.path !== dest) {
          fs.renameSync(image.path, dest);
        }
        imageUrl = `/shared/upload/${content.id}${ext}`;
        content.image = imageUrl;
        await content.save();
      }
      return content;
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

  async findAllByCourseId(courseId: string, dto: ContentQuery) {
    try {
      const { page, limit, sort, order, name, description } = dto;
      const qb = Content.createQueryBuilder('c').where(
        'c.courseId = :courseId',
        { courseId },
      );
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
      const data = rows.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        dateCreated: c.dateCreated,
        image: c.image ?? null,
      }));
      return {
        data,
        meta: { page, limit, total },
      };
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
    image?: Express.Multer.File,
  ): Promise<Content> {
    try {
      const content = await this.findByCourseIdAndId(courseId, id);

      if (!content) {
        throw new HttpException(
          `Could not find content with matching id `,
          HttpStatus.NOT_FOUND,
        );
      }

      if (updateContentDto.name !== undefined)
        content.name = updateContentDto.name;
      if (updateContentDto.description !== undefined)
        content.description = updateContentDto.description;

      if (image) {
        const uploadDir = path.resolve(__dirname, '../../shared/upload');
        const ext = path.extname(image.originalname) || '.jpg';
        const dest = path.join(uploadDir, `${content.id}${ext}`);
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        if (image.path !== dest) {
          fs.renameSync(image.path, dest);
        }
        content.image = `/shared/upload/${content.id}${ext}`;
      }

      await content.save();
      return content;
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
