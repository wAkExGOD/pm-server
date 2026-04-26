import { Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly publicUserSelect = {
    id: true,
    name: true,
    email: true,
    avatarUrl: true,
    createdAt: true,
    verified: true,
  } as const;

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  }

  async findOneById(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findOneByRecoveryPasswordToken(token: string) {
    const data = await this.prisma.passwordRecoveryToken.findUnique({
      where: {
        token: token,
      },
      include: {
        User: true,
      },
    });

    return data?.User;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select: this.publicUserSelect,
    });
  }

  async updateAvatar(id: number, avatarUrl: string) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        avatarUrl,
      },
      select: this.publicUserSelect,
    });
  }

  async verify(id: number) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        verified: true,
      },
    });
  }
}
