import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/CreateUser.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/GetAllUsers.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/GetUserById.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/User';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  async getAll() {
    const users = await this.getAllUsersUseCase.execute();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      lastName: u.lastName,
      isActive: u.isActive,
      role: u.role,
      createdAt: u.createdAt,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const u = await this.getUserByIdUseCase.execute(id);
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      lastName: u.lastName,
      isActive: u.isActive,
      role: u.role,
      createdAt: u.createdAt,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario (solo admin)' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute({
      username: createUserDto.username,
      name: createUserDto.name,
      lastName: createUserDto.lastName,
      passwordHash: createUserDto.password,
      role: createUserDto.role,
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
