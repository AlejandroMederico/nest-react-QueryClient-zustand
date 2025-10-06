import { Controller, Get, Query } from '@nestjs/common';

import { Content } from './content.entity';
import { ContentService } from './content.service';

@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('latest')
  async findLatest(@Query('limit') limit = 5): Promise<Content[]> {
    return this.contentService.findLatestWithCourse(Number(limit));
  }
}
