import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../users/domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../../users/domain/ports/UserRepository.interface';
import { LoginDto } from '../../../auth/infrastructure/dtos/login.dto';
import { UserRole } from '../../../users/domain/entities/User';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number | null;
    username: string;
    name: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(data: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }
}
