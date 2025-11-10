import { Module } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito]), ClientesModule],
  controllers: [FavoritoController],
  providers: [FavoritoService],
})
export class FavoritoModule {}