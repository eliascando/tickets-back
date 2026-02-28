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
export class CloseTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) { }

  async execute(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    if (task.ownerId !== userId) {
      throw new ForbiddenException('Solo el dueño de la tarea puede cerrarla');
    }

    task.status = TaskStatus.COMPLETED;
    task.closedById = userId;

    return this.taskRepository.update(task);
  }
}
