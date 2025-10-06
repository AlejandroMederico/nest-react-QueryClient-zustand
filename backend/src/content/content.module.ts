import { forwardRef, Module } from '@nestjs/common';

import { CourseModule } from '../course/course.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [forwardRef(() => CourseModule)],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
