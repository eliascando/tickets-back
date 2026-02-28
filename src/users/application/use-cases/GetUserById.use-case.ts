import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../domain/ports/UserRepository.interface';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
