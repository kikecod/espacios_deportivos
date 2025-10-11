import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, Res } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { ReservaOwnerOrAdminGuard } from 'src/auth/guard/reserva-owner.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import * as QRCode from 'qrcode';

@ApiTags('pases-acceso')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pases-acceso')
export class PasesAccesoController {
  constructor(private readonly pasesAccesoService: PasesAccesoService) {}

  @Post()
  create(@Body() createPasesAccesoDto: CreatePasesAccesoDto) {
    return this.pasesAccesoService.create(createPasesAccesoDto);
  }

  @Get()
  findAll() {
    return this.pasesAccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pasesAccesoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoService.update(+id, updatePasesAccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pasesAccesoService.remove(+id);
  }

  // Cliente dueño de la reserva o ADMIN: genera pase (devuelve code para QR)
  @UseGuards(ReservaOwnerOrAdminGuard)
  @Post('reservas/:id')
  createForReserva(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number },
  ) {
    return this.pasesAccesoService.createForReserva(id, user.sub);
  }

  // Controlador o ADMIN: verifica scan del QR
  @Roles(TipoRol.CONTROLADOR, TipoRol.ADMIN)
  @Post('scan')
  verifyScan(@Body() body: { code: string }, @CurrentUser() user: { sub: number; roles: string[] }) {
    return this.pasesAccesoService.verifyScan(body.code, user.sub, user.roles || []);
  }

  // Generar PNG del QR (frontend-friendly). Se pasa el `code` recibido al generar el pase.
  @Get('qr')
  async qrPng(@Query('code') code: string, @Res() res: any) {
    if (!code) return res.status(400).send('code requerido');
    const png = await QRCode.toBuffer(code, { type: 'png', errorCorrectionLevel: 'M' });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  }
}
