import { Controller, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatsResponseDto } from './stats.dto';
import { StatsService } from './stats.service';

@Controller('stats')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(): Promise<StatsResponseDto> {
    return await this.statsService.getStats();
  }
}
