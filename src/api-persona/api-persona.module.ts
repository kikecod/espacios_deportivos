import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApiPersonaService } from './api-persona.service';
import { ApiPersonaController } from './api-persona.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [ApiPersonaController],
  providers: [ApiPersonaService],
  exports: [ApiPersonaService],
})
export class ApiPersonaModule {}
