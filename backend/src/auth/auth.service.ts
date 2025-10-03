import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { UserService } from '../user/user.service';
import { LoginDto, LoginResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly SECRET = process.env.JWT_SECRET;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
    response: Response,
  ): Promise<LoginResponseDto> {
    try {
      const { username, password } = loginDto;
      const user = await this.userService.findByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!user.isActive) {
        throw new HttpException('Account is disabled', HttpStatus.UNAUTHORIZED);
      }

      const { id, firstName, lastName, role } = user;

      const accessToken = await this.jwtService.signAsync(
        { username, firstName, lastName, role },
        {
          subject: id,
          expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
          secret: this.SECRET,
        },
      );

      /* Generates a refresh token and stores it in a httponly cookie */
      const refreshToken = await this.jwtService.signAsync(
        { username, firstName, lastName, role },
        {
          subject: id,
          expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
          secret: this.REFRESH_SECRET,
        },
      );

      await this.userService.setRefreshToken(id, refreshToken);

      response.cookie('refresh-token', refreshToken, { httpOnly: true });

      return { token: accessToken, user };
    } catch (error) {
      throw new HttpException(
        `AuthService.login message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(request: Request, response: Response): Promise<boolean> {
    try {
      const userId = request.user['userId'];
      await this.userService.setRefreshToken(userId, null);
      response.clearCookie('refresh-token');
      return true;
    } catch (error) {
      throw new HttpException(
        `AuthService.logout message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new HttpException('Refresh token required', HttpStatus.BAD_REQUEST);
    }

    let userId: string | undefined;

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
      userId = payload?.sub;
      if (!userId) {
        throw new HttpException('Invalid payload', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      if (!user.refreshToken) {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.FORBIDDEN,
        );
      }
      const ok = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!ok) {
        await this.userService.setRefreshToken(userId, null);
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.FORBIDDEN,
        );
      }

      if (user.isActive === false) {
        await this.userService.setRefreshToken(userId, null);
        throw new HttpException('Account is disabled', HttpStatus.UNAUTHORIZED);
      }

      const { firstName, lastName, username, id, role } = user;
      const accessToken = await this.jwtService.signAsync(
        { username, firstName, lastName, role },
        { subject: id, expiresIn: '15m', secret: this.SECRET },
      );

      return { token: accessToken, user };
    } catch (error) {
      response?.clearCookie?.('refresh-token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/api',
      });

      if (userId) {
        try {
          await this.userService.setRefreshToken(userId, null);
        } catch (e) {
          throw new HttpException(
            'AuthService.refresh setting null RT message: ' +
              ((e as any)?.message ?? 'Forbidden'),
            HttpStatus.FORBIDDEN,
          );
        }
      }

      throw new HttpException(
        `AuthService.refresh message: ${
          (error as any)?.message ?? 'Forbidden'
        }`,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
