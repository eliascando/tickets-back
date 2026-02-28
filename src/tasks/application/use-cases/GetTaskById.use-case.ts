import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Task } from '../../domain/entities/Task';
import type { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { TASK_REPOSITORY } from '../../domain/ports/TaskRepository.interface';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }
}
