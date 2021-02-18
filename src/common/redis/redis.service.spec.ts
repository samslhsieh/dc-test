import { Test, TestingModule } from '@nestjs/testing'
import { RedisService } from './redis.service'
import { LoggerService } from '../logger/logger.service'

describe('RedisService', () => {
  let service: RedisService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, LoggerService],
    }).compile()

    service = module.get<RedisService>(RedisService)
  })

  afterAll(async (done) => {
    service && service.client.end(false)
    done()
  })

  it('should be defined', async () => {
    expect(service).toBeDefined()
  })

  it('successfully set and get redis', async () => {
    const value = String(Math.round(Math.random() * 1000))
    await service.client.set('testKey', value)

    const exceptValue = await service.client.get('testKey')
    expect(value).toBe(exceptValue)
  })
})
