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

  /**
   * 可以將部分邏輯封裝起來， middleware 中呼叫此 function
   * 這樣可以讓 test 拆分的更細，並且針對單一的地方進行測試
   * 當業務邏輯變多時，這邊可以更好解耦
   * EX: 當想抽換掉 Redis 改為 RDB 時，只要訂出 Interface 並將 DI 改為符合該 Interface 的物件，
   * 這樣在不必修改 middleware 的情況下就可以達到同樣效果，
   *
   * 但為了開發與 Demo 方便，所以在此直接將 this.client export 出去使用
   */
  // public async rateLimitFindOrSet(key: string) {
  //   const value = await this.client.get(key)
  //
  //   if (isNil(value)) {
  //     await this.client.set(
  //       key,
  //       '1',
  //       'EX',
  //       Number(process.env.RATE_LIMIT_EXPIRED_TIME || 60),
  //     )
  //
  //     return 1
  //   }
  //
  //   if (Number(value) >= Number(process.env.RATE_LIMIT_AMOUNT || 60)) {
  //     throw new HttpException('Forbidden', HttpStatus.TOO_MANY_REQUESTS)
  //   }
  //
  //   await this.client.incrby(key, 1)
  //   return Number(value) + 1
  // }
}
