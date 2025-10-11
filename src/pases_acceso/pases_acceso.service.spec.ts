import { PasesAccesoService } from './pases_acceso.service';
import { Repository } from 'typeorm';

describe('PasesAccesoService.verifyScan', () => {
  const pasesRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } as unknown as Repository<any>;
  const reservaRepo = { findOne: jest.fn() } as unknown as Repository<any>;
  const controlaRepo = { create: jest.fn(), save: jest.fn() } as unknown as Repository<any>;
  const controladorRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } as unknown as Repository<any>;
  const trabajaRepo = { findOne: jest.fn() } as unknown as Repository<any>;
  const usuariosService = { findOne: jest.fn() } as any;

  let svc: PasesAccesoService;

  beforeEach(() => {
    jest.resetAllMocks();
    (controlaRepo.create as any).mockImplementation((x: any) => x);
    (pasesRepo.create as any).mockImplementation((x: any) => x);
    svc = new (PasesAccesoService as any)(pasesRepo, reservaRepo, controlaRepo, controladorRepo, usuariosService, trabajaRepo);
  });

  it('permite scan a CONTROLADOR habilitado en sede y turno', async () => {
    const now = new Date();
    const validoDesde = new Date(now.getTime() - 60_000);
    const validoHasta = new Date(now.getTime() + 60_000);
    pasesRepo.findOne = jest.fn().mockResolvedValue({ idPaseAcceso: 1, idReserva: 10, validoDesde, validoHasta });
    usuariosService.findOne = jest.fn().mockResolvedValue({ idUsuario: 99, idPersona: 5 });
    controladorRepo.findOne = jest.fn().mockResolvedValue({ idPersonaOpe: 5 });
    reservaRepo.findOne = jest.fn().mockResolvedValue({ cancha: { sede: { idSede: 7 } } });
    trabajaRepo.findOne = jest.fn().mockResolvedValue({ idPersonaOpe: 5, idSede: 7, activo: true, fechaInicio: new Date(now.getTime() - 3600_000), fechaFin: new Date(now.getTime() + 3600_000) });
    controlaRepo.save = jest.fn().mockResolvedValue({});

    await expect(svc.verifyScan('abc', 99, ['CONTROLADOR'])).resolves.toEqual({ ok: true, reservaId: 10 });
  });

  it('rechaza scan fuera de turno', async () => {
    const now = new Date();
    const validoDesde = new Date(now.getTime() - 60_000);
    const validoHasta = new Date(now.getTime() + 60_000);
    pasesRepo.findOne = jest.fn().mockResolvedValue({ idPaseAcceso: 1, idReserva: 10, validoDesde, validoHasta });
    usuariosService.findOne = jest.fn().mockResolvedValue({ idUsuario: 99, idPersona: 5 });
    controladorRepo.findOne = jest.fn().mockResolvedValue({ idPersonaOpe: 5 });
    reservaRepo.findOne = jest.fn().mockResolvedValue({ cancha: { sede: { idSede: 7 } } });
    trabajaRepo.findOne = jest.fn().mockResolvedValue({ idPersonaOpe: 5, idSede: 7, activo: true, fechaInicio: new Date(now.getTime() + 3600_000) });
    controlaRepo.save = jest.fn().mockResolvedValue({});

    await expect(svc.verifyScan('abc', 99, ['CONTROLADOR'])).rejects.toThrow();
  });
});

