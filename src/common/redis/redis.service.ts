import * as redis from 'redis'
import * as asyncRedis from 'async-redis'
import { Injectable } from '@nestjs/common'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class RedisService {
  public readonly client

  constructor(private logger: LoggerService) {
    this.logger.setContext('RedisService')

    const redisConfig = {
      host:
        process.env.NODE_ENV && process.env.NODE_ENV.includes('test')
          ? '127.0.0.1'
          : process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT || 6379),
      connect_timeout: 1000 * 60,
    }

    this.client = asyncRedis.createClient(redisConfig)

    this.client.on('connect', () => {
      logger.log(`Redis is connected`)
    })

    this.client.on('ready', () => {
      logger.log(`Redis is ready`)
    })

    this.client.on('error', (error) => {
      logger.error(`Redis catch error`)
      logger.error(error)
    })
  }
}
