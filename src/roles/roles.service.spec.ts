import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  const repo = {
    exist: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
    softDelete: jest.fn(),
  } as any;

  const usuariosService = {} as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('findOne throws NotFound when role does not exist', async () => {
    repo.exist.mockResolvedValue(false);
    const service = new RolesService(repo as any, usuariosService);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update throws NotFound when role does not exist', async () => {
    repo.exist.mockResolvedValue(false);
    const service = new RolesService(repo as any, usuariosService);
    await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});

