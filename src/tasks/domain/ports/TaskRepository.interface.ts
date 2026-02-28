import { Task } from '../entities/Task';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: number): Promise<Task | null>;
  findAll(status?: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  softDelete(id: number): Promise<void>;
}
