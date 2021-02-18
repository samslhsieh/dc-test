import { Module } from '@nestjs/common'
import { CountersService } from './counters.service'

@Module({
  providers: [CountersService],
})
export class CountersModule {}
