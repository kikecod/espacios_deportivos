import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import * as bcrypt from 'bcrypt';

describe('UsuariosService', () => {
  const repo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  } as any;

  const personasService = {
    findOne: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('create hashes password and saves user', async () => {
    personasService.findOne.mockResolvedValue({ idPersona: 1 });
    repo.findOne.mockResolvedValueOnce(null); // correo not taken
    repo.findOne.mockResolvedValueOnce(null); // persona not used
    const createdEntity = {} as any;
    repo.create.mockReturnValue(createdEntity);
    repo.save.mockImplementation(async (e: any) => ({ ...e, idUsuario: 10 }));

    const service = new UsuariosService(repo, personasService);
    const input = {
      idPersona: 1,
      usuario: 'user',
      correo: 'user@example.com',
      contrasena: 'Secret123',
    } as any;

    const saved = await service.create(input);
    expect(saved.idUsuario).toBe(10);
    // ensure bcrypt hashed content was set on entity before save
    const passedToCreate = repo.create.mock.calls[0][0];
    expect(passedToCreate.hashContrasena).toBeDefined();
    expect(passedToCreate.hashContrasena).not.toEqual(input.contrasena);
    await expect(bcrypt.compare('Secret123', passedToCreate.hashContrasena)).resolves.toBe(true);
  });

  it('create fails when correo already exists', async () => {
    personasService.findOne.mockResolvedValue({ idPersona: 1 });
    repo.findOne.mockResolvedValueOnce({ idUsuario: 2 }); // correo taken

    const service = new UsuariosService(repo, personasService);
    await expect(
      service.create({ idPersona: 1, usuario: 'x', correo: 'taken@example.com', contrasena: 'Secret123' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

