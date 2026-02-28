import { Injectable, Inject } from '@nestjs/common';
import { Task, TaskStatus } from '../../domain/entities/Task';
import type { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { TASK_REPOSITORY } from '../../domain/ports/TaskRepository.interface';

@Injectable()
export class GetAllTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(status?: TaskStatus): Promise<Task[]> {
    return this.taskRepository.findAll(status);
  }
}
