import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private config: ConfigService) {
    this.resend = new Resend(config.getOrThrow('RESEND_API_KEY'));
  }

  async sendPasswordResetEmail(toEmail: string, resetLink: string) {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Đặt lại mật khẩu',
      html: `<p>Bấm vào đây để đặt lại mật khẩu <a href="${resetLink}">Đặt lại mật khẩu</a>!</p>`,
    });
  }
}
