import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"ROGU" <${config.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'template'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Reserva, Usuario, PasesAcceso]),
    UsuariosModule,
    PasesAccesoModule,
  ],

  controllers: [],
  providers: [MailsService],
  exports: [MailsService, MailerModule],
})
export class MailsModule { }
