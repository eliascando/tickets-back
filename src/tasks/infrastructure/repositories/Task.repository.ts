import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskRepository } from '../../domain/ports/TaskRepository.interface';
import { Task } from '../../domain/entities/Task';
import { TaskOrmEntity } from '../orm/Task.orm-entity';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly repository: Repository<TaskOrmEntity>,
  ) { }

  private toDomain(ormEntity: TaskOrmEntity): Task {
    return new Task(
      ormEntity.id,
      ormEntity.title,
      ormEntity.description,
      ormEntity.status,
      ormEntity.priority,
      ormEntity.dueDate,
      ormEntity.create_by_id,
      ormEntity.owner_id,
      ormEntity.closed_by_id,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
    );
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async create(task: Task): Promise<Task> {
    const ormEntity = this.repository.create({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      create_by_id: task.createdById,
      owner_id: task.ownerId,
    });
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<Task | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAll(status?: string): Promise<Task[]> {
    const query = status ? { where: { status } } : {};
    const ormEntities = await this.repository.find(query as any);
    return ormEntities.map((e) => this.toDomain(e));
  }

  async update(task: Task): Promise<Task> {
    if (!task.id) {
      throw new Error('Task ID missing');
    }
    const ormEntity = await this.repository.preload({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      create_by_id: task.createdById,
      owner_id: task.ownerId,
      closed_by_id: task.closedById,
    });
    if (!ormEntity) throw new Error('Task not found');
    const updated = await this.repository.save(ormEntity);
    return this.toDomain(updated);
  }
}
