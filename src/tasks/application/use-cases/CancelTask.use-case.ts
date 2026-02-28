import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Task, TaskStatus } from '../../domain/entities/Task';
import type { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { TASK_REPOSITORY } from '../../domain/ports/TaskRepository.interface';

@Injectable()
export class CancelTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new ForbiddenException(
        'No se puede cancelar una tarea que ya fue completada',
      );
    }

    if (task.status === TaskStatus.CANCELLED) {
      throw new ForbiddenException('La tarea ya está cancelada');
    }

    task.status = TaskStatus.CANCELLED;

    return this.taskRepository.update(task);
  }
}
