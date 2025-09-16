import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanchaModule } from './cancha/cancha.module';
import { SedeModule } from './sede/sede.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',       // Base de datos
      host: 'localhost',      // Cambia si usas Docker o servidor externo
      port: 5432,             // Puerto por defecto
      username: 'postgres', // Usuario de PostgreSQL
      password: '123456',
      database: 'espacios_deportivos',
      autoLoadEntities: true, // Carga automática de entidades
      synchronize: true,      // ⚠️ Solo en desarrollo (crea/actualiza tablas)
    }),
    CanchaModule,
    SedeModule,
  ],
})
export class AppModule {}
