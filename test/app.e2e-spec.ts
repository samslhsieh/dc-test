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
      on: jest.fn(),
      set: mockedRedisSet,
      get: mockedRedisGet,
      incrby: mockedRedisIncrby,
    }),
  }
})

describe('AppController (e2e)', () => {
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

  beforeAll(async (done) => {
    app && (await app.close())
    done()
  })

  it('have not rate Limit, number Of requests can more than 60 times', async () => {
    const resp = await request(app.getHttpServer()).get('/').query({})

    expect(resp.status).toBe(HttpStatus.OK)
    expect(resp.text).toBe('Hello World!')

    expect(mockedRedisGet).toBeCalledTimes(0)
    expect(mockedRedisSet).toBeCalledTimes(0)
    expect(mockedRedisIncrby).toBeCalledTimes(0)
  })
})
