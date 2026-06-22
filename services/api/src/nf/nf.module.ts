import { Module } from '@nestjs/common';
import { NfController } from './nf.controller';
import { NfService } from './nf.service';
import { NfParserService } from './nf-parser.service';

@Module({
  controllers: [NfController],
  providers: [NfService, NfParserService],
  exports: [NfService, NfParserService],
})
export class NfModule {}
