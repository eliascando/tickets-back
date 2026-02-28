import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../domain/entities/Task';
import type { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { TASK_REPOSITORY } from '../../domain/ports/TaskRepository.interface';

interface UpdateTaskDtoData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  ownerId?: number;
  closedById?: number | null;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) { }

  async execute(id: number, data: UpdateTaskDtoData): Promise<Task> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if (existingTask.status !== TaskStatus.PENDING) {
      throw new ForbiddenException(
        'Solo se pueden editar tareas en estado pendiente',
      );
    }

    if (data.title !== undefined) existingTask.title = data.title;
    if (data.description !== undefined)
      existingTask.description = data.description;
    if (data.status !== undefined) existingTask.status = data.status;
    if (data.priority !== undefined) existingTask.priority = data.priority;
    if (data.dueDate !== undefined) existingTask.dueDate = data.dueDate;
    if (data.ownerId !== undefined) existingTask.ownerId = data.ownerId;
    if (data.closedById !== undefined)
      existingTask.closedById = data.closedById;

    return this.taskRepository.update(existingTask);
  }
}
