import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/orm/User.orm-entity';
import { TaskStatus, TaskPriority } from '../../domain/entities/Task';

@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'create_by_id' })
  createdBy: UserOrmEntity;

  @Column()
  create_by_id: number;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: UserOrmEntity | null;

  @Column({ nullable: true })
  owner_id: number | null;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'closed_by_id' })
  closedBy: UserOrmEntity | null;

  @Column({ nullable: true })
  closed_by_id: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
