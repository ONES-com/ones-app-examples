import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Response } from 'express';
import { InstallCallback } from './entities/install-callback.entity';
import { WatcherRule } from './entities/watcher-rule.entity';
import { DatabaseService } from './services/database.service';
import { OpenApiService } from './services/openapi.service';
import { AuthService } from './services/auth.service';
import { WatcherRuleService } from './services/watcher-rule.service';
import { IssueWatcherService } from './services/issue-watcher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_FILE || './app.db',
      entities: [InstallCallback, WatcherRule],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([InstallCallback, WatcherRule]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'web', 'dist'),
      serveRoot: '/static',
      serveStaticOptions: {
        index: false,
        setHeaders: (res: Response) => {
          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS',
          );
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With',
          );
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    OpenApiService,
    AuthService,
    WatcherRuleService,
    IssueWatcherService,
  ],
})
export class AppModule {}
