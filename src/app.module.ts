import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/infrastructure/users.module';
import { TasksModule } from './tasks/infrastructure/tasks.module';
import { AuthModule } from './auth/infrastructure/auth.module';
import { UserOrmEntity } from './users/infrastructure/orm/User.orm-entity';
import { TaskOrmEntity } from './tasks/infrastructure/orm/Task.orm-entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'ticketsdb'),
        entities: [UserOrmEntity, TaskOrmEntity],
        synchronize: true,
      }),
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule { }
