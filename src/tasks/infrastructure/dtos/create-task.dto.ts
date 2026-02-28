import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../domain/entities/Task';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Actualizar servidor',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada',
    example: 'Instalar parches de seguridad',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ description: 'ID del usuario creador', example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdById: number;

  @ApiPropertyOptional({
    description: 'ID del usuario asignado (puede ser nulo)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}
