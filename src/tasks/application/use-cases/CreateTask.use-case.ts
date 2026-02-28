import { Injectable, Inject } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../domain/entities/Task';
import type { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { TASK_REPOSITORY } from '../../domain/ports/TaskRepository.interface';

interface CreateTaskDtoData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  createdById: number;
  ownerId?: number;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(data: CreateTaskDtoData): Promise<Task> {
    const newTask = new Task(
      null,
      data.title,
      data.description || null,
      TaskStatus.PENDING,
      data.priority || TaskPriority.MEDIUM,
      data.dueDate || null,
      data.createdById,
      data.ownerId || null,
      null,
    );

    return this.taskRepository.create(newTask);
  }
}
