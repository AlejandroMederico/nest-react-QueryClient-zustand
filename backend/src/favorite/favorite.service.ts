import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async addFavorite(userId: string, courseId: string) {
    const user = await this.userRepo.findOne(userId);
    const course = await this.courseRepo.findOne(courseId);
    if (!user || !course)
      throw new HttpException('User or course not found', HttpStatus.NOT_FOUND);
    const exists = await this.favoriteRepo.findOne({ where: { user, course } });
    if (exists) return exists;
    const fav = this.favoriteRepo.create({ user, course });
    return await this.favoriteRepo.save(fav);
  }

  async removeFavorite(userId: string, courseId: string) {
    const user = await this.userRepo.findOne(userId);
    const course = await this.courseRepo.findOne(courseId);
    if (!user || !course)
      throw new HttpException('User or course not found', HttpStatus.NOT_FOUND);
    const fav = await this.favoriteRepo.findOne({ where: { user, course } });
    if (!fav)
      throw new HttpException('Favorite not found', HttpStatus.NOT_FOUND);
    await this.favoriteRepo.remove(fav);
    return { removed: true };
  }

  async listFavorites(userId: string) {
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const favs = await this.favoriteRepo.find({
      where: { user },
      relations: ['course'],
    });
    return favs.map((f) => f.course);
  }

  async isFavorite(userId: string, courseId: string) {
    const user = await this.userRepo.findOne(userId);
    const course = await this.courseRepo.findOne(courseId);
    if (!user || !course) return false;
    const fav = await this.favoriteRepo.findOne({ where: { user, course } });
    return !!fav;
  }
}
