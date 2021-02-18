import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

const mockedRedisSet = jest.fn()
const mockedRedisGet = jest.fn()
const mockedRedisIncrby = jest.fn()

jest.mock('async-redis', () => {
  return {
    createClient: () => ({
      on: (a, b) => {},
      set: mockedRedisSet,
      get: mockedRedisGet,
      incrby: mockedRedisIncrby,
    }),
  }
})

describe('CountersController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    mockedRedisSet.mockRestore()
    mockedRedisGet.mockRestore()
    mockedRedisIncrby.mockRestore()
  })

  afterAll(async (done) => {
    app && (await app.close())
    done()
  })

  it('successfully get counter', async () => {
    const lastCount = null

    mockedRedisGet.mockImplementationOnce(async () => lastCount)

    const resp = await request(app.getHttpServer()).get('/counters').query({})

    expect(resp.status).toBe(HttpStatus.OK)
    expect(resp.body).toEqual({ numberOfRequests: lastCount + 1 })

    expect(mockedRedisGet).toBeCalledTimes(1)
    expect(mockedRedisSet).toBeCalledTimes(1)
    expect(mockedRedisIncrby).toBeCalledTimes(0)
  })

  it('successfully get counter and counter !== null', async () => {
    const lastCount = 5
    const currentCount = lastCount + 1

    mockedRedisGet.mockImplementationOnce(async () => lastCount)
    mockedRedisIncrby.mockImplementationOnce(async () => currentCount + 1)

    const resp = await request(app.getHttpServer()).get('/counters').query({})

    expect(resp.status).toBe(HttpStatus.OK)
    expect(resp.body).toEqual({ numberOfRequests: currentCount })

    expect(mockedRedisGet).toBeCalledTimes(1)
    expect(mockedRedisSet).toBeCalledTimes(0)
    expect(mockedRedisIncrby).toBeCalledTimes(1)
  })

  it('should throw error if counter >= rateLimit', async () => {
    const lastCount = 60
    const currentCount = lastCount + 1

    mockedRedisGet.mockImplementationOnce(async () => lastCount)
    mockedRedisIncrby.mockImplementationOnce(async () => currentCount + 1)

    const resp = await request(app.getHttpServer()).get('/counters').query({})

    expect(resp.status).toBe(HttpStatus.TOO_MANY_REQUESTS)
    expect(resp.body).toEqual({ message: 'Forbidden', statusCode: 429 })

    expect(mockedRedisGet).toBeCalledTimes(1)
    expect(mockedRedisSet).toBeCalledTimes(0)
    expect(mockedRedisIncrby).toBeCalledTimes(0)
  })
})
