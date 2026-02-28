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
export class ClaimTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) { }

  async execute(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    task.ownerId = userId;
    task.status = TaskStatus.IN_PROGRESS;

    return this.taskRepository.update(task);
  }
}
