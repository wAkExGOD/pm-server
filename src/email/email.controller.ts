import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { emailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendMail(@Body() dto: emailDto) {
    const status = await this.emailService.sendEmail(dto);

    return {
      success: status,
      message: status ? 'Email sent successfully' : 'Error sending email',
    };
  }
}
