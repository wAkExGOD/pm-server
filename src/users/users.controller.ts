import {
  BadRequestException,
  ForbiddenException,
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Request,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type RequestWithUser } from 'src/types';

const AVATARS_DIR = join(process.cwd(), 'uploads', 'avatars');

const ensureAvatarsDir = () => {
  if (!existsSync(AVATARS_DIR)) {
    mkdirSync(AVATARS_DIR, { recursive: true });
  }
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          ensureAvatarsDir();
          callback(null, AVATARS_DIR);
        },
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(
            null,
            `avatar-${uniqueSuffix}${extname(file.originalname || '.png')}`,
          );
        },
      }),
    }),
  )
  async uploadAvatar(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: { filename: string },
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can update only your own avatar');
    }

    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    return await this.usersService.updateAvatar(
      id,
      `/uploads/avatars/${file.filename}`,
    );
  }
}
