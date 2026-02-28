import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../../users/domain/entities/User';
import type { IUserRepository } from '../../../users/domain/ports/UserRepository.interface';
import { USER_REPOSITORY } from '../../../users/domain/ports/UserRepository.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const dbUser = await this.userRepository.findById(user.userId);
    if (!dbUser) return false;

    return requiredRoles.includes(dbUser.role);
  }
}
