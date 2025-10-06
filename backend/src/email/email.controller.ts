import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ContactDto } from './email.dto';
import { EmailService } from './email.service';

@ApiTags('Contacto')
@Controller('contact')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje de contacto' })
  @ApiBody({ type: ContactDto })
  @ApiResponse({ status: 201, description: 'Mensaje enviado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async sendContact(@Body() body: ContactDto) {
    const subject = `Nuevo mensaje de contacto de ${body.name}`;
    const text = `${body.message}\n\nEmail de contacto: ${body.email}`;
    try {
      await this.emailService.sendMail(subject, text, body.email);
      return {
        success: true,
      };
    } catch (error) {
      return { error };
    }
  }
}
