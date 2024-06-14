import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyController } from './proxy/proxy.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController, ProxyController],
  providers: [AppService],
})
export class AppModule {}
