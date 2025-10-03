import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { LoginDto, LoginResponseDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto, response);
  }

  @UseGuards(JwtGuard)
  @Post('/logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    return await this.authService.logout(request, response);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res() response: Response) {
    const rt = (request as any)?.cookies?.['refresh-token'];
    if (!rt) {
      return response.status(401).json({ message: 'No refresh token' });
    }

    try {
      const result = await this.authService.refresh(rt, response);
      if ((result as any)?.newRefreshToken) {
        response.cookie('refresh-token', (result as any).newRefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/api',
          maxAge: 7 * 24 * 3600 * 1000,
        });
      }

      return response.json({ token: result.token, user: result.user });
    } catch (e: any) {
      response.clearCookie('refresh-token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/api',
      });
      const status = e?.status ?? 403;
      return response
        .status(status)
        .json({ message: e?.message ?? 'Forbidden' });
    }
  }
}
