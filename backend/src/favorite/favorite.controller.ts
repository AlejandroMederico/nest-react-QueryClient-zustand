import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FavoriteService } from './favorite.service';

@Controller('courses/:courseId/favorite')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  async add(@Req() req, @Param('courseId') courseId: string) {
    const userId = req.user.userId;
    return await this.favoriteService.addFavorite(userId, courseId);
  }

  @Delete()
  async remove(@Req() req, @Param('courseId') courseId: string) {
    const userId = req.user.userId;
    return await this.favoriteService.removeFavorite(userId, courseId);
  }

  @Get()
  async isFavorite(@Req() req, @Param('courseId') courseId: string) {
    const userId = req.user.userId;
    return await this.favoriteService.isFavorite(userId, courseId);
  }
}

@Controller('users/:userId/favorites')
@UseGuards(JwtGuard)
export class UserFavoritesController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  async list(@Param('userId') userId: string) {
    return await this.favoriteService.listFavorites(userId);
  }
}
