import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskOrmEntity } from './orm/Task.orm-entity';
import { TaskRepository } from './repositories/Task.repository';
import { CreateTaskUseCase } from '../application/use-cases/CreateTask.use-case';
import { GetAllTasksUseCase } from '../application/use-cases/GetAllTasks.use-case';
import { GetTaskByIdUseCase } from '../application/use-cases/GetTaskById.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/UpdateTask.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/DeleteTask.use-case';
import { ClaimTaskUseCase } from '../application/use-cases/ClaimTask.use-case';
import { CloseTaskUseCase } from '../application/use-cases/CloseTask.use-case';
import { CancelTaskUseCase } from '../application/use-cases/CancelTask.use-case';
import { TasksController } from './controllers/Tasks.controller';
import { TASK_REPOSITORY } from '../domain/ports/TaskRepository.interface';
import { UsersModule } from '../../users/infrastructure/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskOrmEntity]), UsersModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    GetAllTasksUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    ClaimTaskUseCase,
    CloseTaskUseCase,
    CancelTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskRepository,
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}
