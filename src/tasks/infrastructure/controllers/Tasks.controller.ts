import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTaskUseCase } from '../../application/use-cases/CreateTask.use-case';
import { GetAllTasksUseCase } from '../../application/use-cases/GetAllTasks.use-case';
import { GetTaskByIdUseCase } from '../../application/use-cases/GetTaskById.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/UpdateTask.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/DeleteTask.use-case';
import { ClaimTaskUseCase } from '../../application/use-cases/ClaimTask.use-case';
import { CloseTaskUseCase } from '../../application/use-cases/CloseTask.use-case';
import { CancelTaskUseCase } from '../../application/use-cases/CancelTask.use-case';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UserRole } from '../../../users/domain/entities/User';
import { TaskStatus } from '../../domain/entities/Task';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly claimTaskUseCase: ClaimTaskUseCase,
    private readonly closeTaskUseCase: CloseTaskUseCase,
    private readonly cancelTaskUseCase: CancelTaskUseCase,
  ) { }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las tareas (soporta filtrado por estado)',
  })
  @ApiQuery({
    name: 'status',
    enum: TaskStatus,
    required: false,
    description:
      'Filtrar tareas por estado (pending, in_progress, completed, cancelled)',
  })
  async getAll(@Query('status') status?: TaskStatus) {
    return this.getAllTasksUseCase.execute(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getTaskByIdUseCase.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.createTaskUseCase.execute({
      title: createTaskDto.title,
      description: createTaskDto.description,
      priority: createTaskDto.priority,
      dueDate: createTaskDto.dueDate,
      createdById: createTaskDto.createdById,
      ownerId: createTaskDto.ownerId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una tarea (solo admin)' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden editar tareas',
      );
    }
    return this.updateTaskUseCase.execute(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una tarea - soft delete (solo admin)' })
  async deleteTask(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar tareas',
      );
    }
    await this.deleteTaskUseCase.execute(id);
  }

  @Patch(':id/claim')
  @ApiOperation({ summary: 'Reclamar una tarea (asignarse como dueño)' })
  async claimTask(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.claimTaskUseCase.execute(id, req.user.userId);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Cerrar una tarea reclamada (solo el dueño)' })
  async closeTask(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.closeTaskUseCase.execute(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar una tarea (no se puede si está completada)',
  })
  async cancelTask(@Param('id', ParseIntPipe) id: number) {
    return this.cancelTaskUseCase.execute(id);
  }
}
