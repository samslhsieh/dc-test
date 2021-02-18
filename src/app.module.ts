import { ConfigModule } from '@nestjs/config'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CountersController } from './counters/counters.controller'
import { CountersModule } from './counters/counters.module'
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware'
import { RedisModule } from './common/redis/redis.module'
import { LoggerService } from './common/logger/logger.service'
import { LoggerModule } from './common/logger/logger.module'

@Module({
  imports: [ConfigModule.forRoot(), CountersModule, RedisModule, LoggerModule],
  controllers: [AppController, CountersController],
  providers: [AppService, LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('counters')
  }
}
