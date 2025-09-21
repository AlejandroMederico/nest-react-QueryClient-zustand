import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ILike } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserQuery } from './user.query';

@Injectable()
export class UserService {
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
        `An error UserService.save message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userQuery: UserQuery): Promise<User[]> {
    try {
      Object.keys(userQuery).forEach((key) => {
        if (key !== 'role') {
          userQuery[key] = ILike(`%${userQuery[key]}%`);
        }
      });

      return await User.find({
        where: userQuery,
        order: {
          firstName: 'ASC',
          lastName: 'ASC',
        },
      });
    } catch (error) {
      throw new HttpException(
        `An error UserService.findAll message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
        `An error UserService.findById message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      return await User.findOne({ where: { username } });
    } catch (error) {
      throw new HttpException(
        `An error UserService.findByUsername message: ${error.message}`,
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
        `An error UserService.update message: ${error.message}`,
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
        `An error UserService.delete message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await User.count();
    } catch (error) {
      throw new HttpException(
        `An error UserService.count message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    try {
      // Verificar la validez y expiración del token de refresco
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      if (!decoded || (decoded as any).exp * 1000 < Date.now()) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await this.findById(id);
      await User.update(user, {
        refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
      });
    } catch (error) {
      throw new HttpException(
        `An error UserService.setRefreshToken message: ${error.message}`,
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
        `An error UserService.softDelete message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
