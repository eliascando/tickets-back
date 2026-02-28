import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../domain/ports/UserRepository.interface';

@Injectable()
export class UsersSeederService implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminUsername = 'admin';
    const existingAdmin =
      await this.userRepository.findByUsername(adminUsername);

    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const saltRounds = 10;
      const defaultPassword = this.configService.get<string>('ADMIN_DEFAULT_PASSWORD', 'password');
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      const newAdmin = new User(
        null,
        adminUsername,
        'Administrador',
        'Sistema',
        hashedPassword,
        true,
        UserRole.ADMIN,
      );

      await this.userRepository.create(newAdmin);
      console.log('Default admin user created successfully.');
    } else {
      console.log('Admin user already exists, skipping seed.');
    }
  }
}
