import * as nodemailer from 'nodemailer';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as any);
    service = new EmailService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('envía el correo con los argumentos correctos', async () => {
    process.env.SMTP_USER = 'user@test.com';
    process.env.EMAIL_TO = 'dest@test.com';
    await service.sendMail('Asunto', 'Texto', 'remitente@test.com');
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'user@test.com',
      to: 'dest@test.com',
      subject: 'Asunto',
      text: 'Remitente: remitente@test.com\n\nTexto',
    });
  });

  it('propaga el error si sendMail falla', async () => {
    const error = new Error('SMTP error');
    sendMailMock.mockRejectedValueOnce(error);
    await expect(service.sendMail('A', 'B', 'C')).rejects.toThrow('SMTP error');
  });
});
