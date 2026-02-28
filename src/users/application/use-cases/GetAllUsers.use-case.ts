import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../domain/ports/UserRepository.interface';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
