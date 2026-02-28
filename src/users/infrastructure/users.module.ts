import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './orm/User.orm-entity';
import { UserRepository } from './repositories/User.repository';
import { CreateUserUseCase } from '../application/use-cases/CreateUser.use-case';
import { GetAllUsersUseCase } from '../application/use-cases/GetAllUsers.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/GetUserById.use-case';
import { UsersController } from './controllers/Users.controller';
import { USER_REPOSITORY } from '../domain/ports/UserRepository.interface';
import { UsersSeederService } from './services/users-seeder.service';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), ConfigModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UsersSeederService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class UsersModule { }
