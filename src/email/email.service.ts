import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { emailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    return transporter;
  }

  async sendEmail(dto: emailDto) {
    const { recipients, subject, html } = dto;

    const transport = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject: subject,
      html: html,
    };

    try {
      await transport.sendMail(options);
      return true;
    } catch (error) {
      console.error('Error sending mail: ', error);
      return false;
    }
  }
}
