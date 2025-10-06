import { Test, TestingModule } from '@nestjs/testing';

import { EmailController } from './email.controller';
import { ContactDto } from './email.dto';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;
  let service: EmailService;

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [{ provide: EmailService, useValue: mockEmailService }],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    service = module.get<EmailService>(EmailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendContact', () => {
    it('envía el mensaje y retorna success', async () => {
      const dto: ContactDto = {
        name: 'Juan',
        email: 'juan@test.com',
        message: 'Hola, esto es un mensaje.',
      };
      service.sendMail = jest.fn().mockResolvedValue(undefined);
      const res = await controller.sendContact(dto);
      expect(service.sendMail).toHaveBeenCalledWith(
        `Nuevo mensaje de contacto de ${dto.name}`,
        `${dto.message}\n\nEmail de contacto: ${dto.email}`,
        dto.email,
      );
      expect(res).toEqual({ success: true });
    });

    it('retorna error si el servicio falla', async () => {
      const dto: ContactDto = {
        name: 'Ana',
        email: 'ana@test.com',
        message: 'Mensaje de prueba.',
      };
      const error = new Error('Fallo de envío');
      service.sendMail = jest.fn().mockRejectedValue(error);
      const res = await controller.sendContact(dto);
      expect(res).toEqual({ error });
    });
  });
});
