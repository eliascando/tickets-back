import { Injectable, Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../domain/ports/UserRepository.interface';

interface CreateUserDtoData {
  username: string;
  name: string;
  lastName: string;
  passwordHash: string;
  role?: UserRole;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(data: CreateUserDtoData): Promise<User> {
    const existingUser = await this.repository.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);

    const newUser = new User(
      null,
      data.username,
      data.name,
      data.lastName,
      hashedPassword,
      true,
      data.role || UserRole.USER,
    );

    return this.userRepository.create(newUser);
  }

  private get repository() {
    return this.userRepository;
  }
}
