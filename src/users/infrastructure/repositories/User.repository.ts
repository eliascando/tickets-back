import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/ports/UserRepository.interface';
import { User } from '../../domain/entities/User';
import { UserOrmEntity } from '../orm/User.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  private toDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.username,
      ormEntity.name,
      ormEntity.lastName,
      ormEntity.passwordHash,
      ormEntity.isActive,
      ormEntity.role,
      ormEntity.createdAt,
    );
  }

  async create(user: User): Promise<User> {
    const ormEntity = this.repository.create({
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      role: user.role,
    });
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findByUsername(username: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { username } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAll(): Promise<User[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map((e) => this.toDomain(e));
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required for update');
    }
    const ormEntity = await this.repository.preload({
      id: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      role: user.role,
    });
    if (!ormEntity) {
      throw new Error('User not found');
    }
    const updated = await this.repository.save(ormEntity);
    return this.toDomain(updated);
  }
}
