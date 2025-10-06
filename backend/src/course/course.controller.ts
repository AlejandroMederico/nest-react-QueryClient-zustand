import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateContentDto, UpdateContentDto } from '../content/content.dto';
import { Content } from '../content/content.entity';
import { ContentQuery } from '../content/content.query';
import { ContentService } from '../content/content.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';
import { CourseService } from './course.service';

@Controller('courses')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly contentService: ContentService,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Editor)
  async save(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.save(createCourseDto);
  }

  @Get()
  async findAll(@Query() courseQuery: CourseQuery) {
    return await this.courseService.findAll(courseQuery);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return await this.courseService.findById(id);
  }

  @Put('/:id')
  @Roles(Role.Admin, Role.Editor)
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return await this.courseService.update(id, updateCourseDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  async delete(@Param('id') id: string): Promise<string> {
    return await this.courseService.delete(id);
  }

  @Post('/:id/contents')
  @Roles(Role.Admin, Role.Editor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'binary', nullable: true },
      },
      required: ['name', 'description'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: path.resolve(__dirname, '../../shared/upload'),
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async saveContent(
    @Param('id') id: string,
    @Body() createContentDto: CreateContentDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Content> {
    return await this.contentService.save(id, createContentDto, image);
  }

  @Get('/:id/contents')
  async findAllContentsByCourseId(
    @Param('id') id: string,
    @Query() contentQuery: ContentQuery,
  ) {
    return await this.contentService.findAllByCourseId(id, contentQuery);
  }

  @Put('/:id/contents/:contentId')
  @Roles(Role.Admin, Role.Editor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        image: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: path.resolve(__dirname, '../../shared/upload'),
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateContent(
    @Param('id') id: string,
    @Param('contentId') contentId: string,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Content> {
    return await this.contentService.update(
      id,
      contentId,
      updateContentDto,
      image,
    );
  }

  @Delete('/:id/contents/:contentId')
  @Roles(Role.Admin)
  async deleteContent(
    @Param('id') id: string,
    @Param('contentId') contentId: string,
  ): Promise<string> {
    return await this.contentService.delete(id, contentId);
  }
}
