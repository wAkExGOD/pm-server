import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { type RequestWithUser } from 'src/types';
import { ForgotPasswordDto } from 'src/users/dto/forgot-password.dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: RequestWithUser) {
    const payloadWithToken = await this.authService.login(req.user);

    return payloadWithToken;
  }

  @Post('register')
  async register(@Body() registerBody: CreateUserDto) {
    return await this.authService.register(registerBody);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordBody: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordBody.email);
  }

  @Post('change-password')
  @UsePipes(new ValidationPipe())
  async changePassword(@Body() changePasswordBody: ChangePasswordDto) {
    return await this.authService.changePassword(
      changePasswordBody.token,
      changePasswordBody.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    return await this.authService.getProfileByEmail(req.user.email);
  }

  @Get('confirm/:token')
  async confirmEmail(@Res() res: Response, @Param('token') token: string) {
    return await this.authService.confirmEmail(token, res);
  }
}
