import { isNil } from 'ramda'
import * as requestIp from 'request-ip'
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { RedisService } from '../redis/redis.service'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    private logger: LoggerService,
    private redisService: RedisService,
  ) {
    this.logger.setContext('RateLimitMiddleware')
  }

  async use(
    req: Request & { numberOfRequests: string },
    res: Response,
    next: NextFunction,
  ) {
    try {
      // TODO: support IPv6
      const ip = requestIp.getClientIp(req).split(':')[3]
      this.logger.debug(`request client IP : ${ip}`)

      let amount = await this.redisService.client.get(ip)

      if (Number(amount) >= Number(process.env.RATE_LIMIT_AMOUNT || 60)) {
        return next(
          new HttpException('Forbidden', HttpStatus.TOO_MANY_REQUESTS),
        )
      }

      if (isNil(amount)) {
        await this.redisService.client.set(
          ip,
          '1',
          'EX',
          Number(process.env.RATE_LIMIT_EXPIRED_TIME || 60),
        )
        amount = 1
      } else {
        await this.redisService.client.incrby(ip, 1)
        amount++
      }

      req.numberOfRequests = amount

      next()
    } catch (error) {
      this.logger.error(error)
    }
  }
}
