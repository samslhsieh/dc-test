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

  describe('successfully set and get value', () => {
    for (let i = 0; i < 5; i++) {
      const value = Math.round(Math.random() * 10000)
      const key = `test${i}-${value}`

      it(`key: ${key}, value: ${value}`, async () => {
        await service.client.set(key, value)

        const exceptValue = await service.client.get(key)
        expect(exceptValue).toBe(String(value))
      })
    }
  })

  it('successfully add value ', async () => {
    const value = Math.round(Math.random() * 10000)
    const key = `test-${value}`

    await service.client.set(key, value)
    await service.client.incrby(key, 1)

    const exceptValue = await service.client.get(key)
    expect(exceptValue).toBe(String(value + 1))
  })
})
