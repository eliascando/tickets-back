import { IsString, IsOptional, IsEnum, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../domain/entities/Task';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Nuevo título' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción detallada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, description: 'Estado de la tarea' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiPropertyOptional({ example: 2, description: 'Reasignar a otro usuario' })
  @IsOptional()
  @IsInt()
  ownerId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario que cierra la tarea',
  })
  @IsOptional()
  @IsInt()
  closedById?: number;
}
