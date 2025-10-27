import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { TipoRol } from 'src/roles/rol.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { PagosService } from './pagos.service';
import { RegistrarDeudaDto } from './dto/registrar-deuda.dto';
import { LibelulaCallbackDto } from './dto/libelula-callback.dto';

type AuthenticatedRequest = Request & {
  user?: {
    id_persona?: number;
    roles?: string[];
  };
};

@ApiTags('pagos')
@Controller()
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly configService: ConfigService,
  ) {}

  @Post('deudas/registrar')
  @Auth([TipoRol.CLIENTE])
  @ApiOperation({
    summary: 'Registra una deuda en Libelula para completar el pago',
  })
  async registrarDeuda(
    @Body() dto: RegistrarDeudaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const clienteId = req.user?.id_persona;
    if (!clienteId) {
      // El guard de Auth deberia haber poblado el user; fallback defensivo
      throw new InternalServerErrorException(
        'No se pudo identificar al cliente autenticado',
      );
    }

    const resultado = await this.pagosService.registrarDeuda({
      ...dto,
      clienteId,
    });

    return {
      message: 'Deuda registrada con exito',
      ...resultado,
    };
  }

  @Get('pago-exitoso')
  @ApiOperation({
    summary:
      'Callback de Libelula para confirmar el pago; persiste la transaccion y redirige al frontend',
  })
  async pagoExitoso(
    @Query() query: LibelulaCallbackDto,
    @Res() res: Response,
  ) {
    await this.pagosService.manejarPagoExitoso(query);
    const successUrl =
      this.configService.get<string>('LIBELULA_RETURN_URL') ||
      '/checkout/success';
    res.redirect(successUrl);
  }
}
