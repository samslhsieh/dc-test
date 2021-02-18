import { Request } from 'express'
import { Controller, Get, Req } from '@nestjs/common'

@Controller('counters')
export class CountersController {
  @Get()
  getCounters(
    @Req() request: Request & { numberOfRequests: string },
  ): { numberOfRequests: string } {
    const { numberOfRequests } = request

    return { numberOfRequests }
  }
}
