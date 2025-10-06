import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import {
  FavoriteController,
  UserFavoritesController,
} from './favorite.controller';
import { Favorite } from './favorite.entity';
import { FavoriteService } from './favorite.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Course])],
  providers: [FavoriteService],
  controllers: [FavoriteController, UserFavoritesController],
  exports: [FavoriteService],
})
export class FavoriteModule {}
