import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto, UsersListQueryDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async save(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.findByUsername(createUserDto.username);

      if (user) {
        throw new HttpException(
          'A user with this username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { password } = createUserDto;
      createUserDto.password = await bcrypt.hash(password, 10);
      return await User.create(createUserDto).save();
    } catch (error) {
      throw new HttpException(
        `UserService.save message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(dto: UsersListQueryDto) {
    const { page, limit, q, role, sort, order } = dto;

    const SORT_MAP: Record<string, string> = {
      username: 'u.username',
      firstName: 'u.firstName',
      lastName: 'u.lastName',
      role: 'u.role',
      isActive: 'u.isActive',
      createdAt: 'u.createdAt',
    };
    const sortColumn = SORT_MAP[sort] ?? 'u.createdAt';
    const sortOrder = order.toUpperCase() as 'ASC' | 'DESC';

    const qb = this.repo.createQueryBuilder('u');

    if (q && q.trim()) {
      const like = `%${q.trim()}%`;
      qb.andWhere(
        '(u.username ILIKE :like OR u.firstName ILIKE :like OR u.lastName ILIKE :like)',
        { like },
      );
    }

    if (role) {
      qb.andWhere('u.role = :role', { role });
    }

    qb.orderBy(sortColumn, sortOrder);

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const data = rows.map(({ ...safe }) => safe);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await User.findOne(id);

      if (!user) {
        throw new HttpException(
          `Could not find user with matching id ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      throw new HttpException(
        `UserService.findById message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      return await User.findOne({ where: { username } });
    } catch (error) {
      throw new HttpException(
        `UserService.findByUsername message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const currentUser = await this.findById(id);

      /* If username is same as before, delete it from the dto */
      if (currentUser.username === updateUserDto.username) {
        delete updateUserDto.username;
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (updateUserDto.username) {
        if (await this.findByUsername(updateUserDto.username)) {
          throw new HttpException(
            'A user with this username already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await User.create({ id, ...updateUserDto }).save();
    } catch (error) {
      throw new HttpException(
        `UserService.update message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<string> {
    try {
      await User.delete(await this.findById(id));
      return id;
    } catch (error) {
      throw new HttpException(
        `UserService.delete message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await User.count();
    } catch (error) {
      throw new HttpException(
        `UserService.count message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    try {
      const user = await this.findById(id);
      await User.update(user, {
        refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
      });
    } catch (error) {
      throw new HttpException(
        `UserService.setRefreshToken message: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async softDelete(userId: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.isActive = false;
      await user.save();
    } catch (error) {
      throw new HttpException(
        `UserService.softDelete message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
