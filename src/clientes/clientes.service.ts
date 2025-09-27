import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';


@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateClienteDto) {
    return this.dataSource.transaction(async (manager) => {
    
      const persona = manager.create(Persona, dto.persona);
      await manager.save(Persona, persona);

      const cliente = manager.create(Cliente, {
        idCliente: persona.idPersona,
        persona,
        apodo: dto.apodo,
        nivel: dto.nivel ?? 1,
        observaciones: dto.observaciones,
      });
      await manager.save(Cliente, cliente);

      return cliente;
    });
  }

  findAll() {
    return this.clienteRepo.find({
      relations: ['persona'],
    });
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepo.findOne({
      where: { idCliente: id },
      relations: ['persona'],
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente #${id} no encontrado`);
    }
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
  let personaId: number | undefined;

  if (dto.persona) {
    const clienteExistente = await this.findOne(id);
    personaId = clienteExistente.persona.idPersona;
    await this.personaRepo.update(personaId, dto.persona);
  }

  const cliente = await this.clienteRepo.preload({
    idCliente: id,
    apodo: dto.apodo,
    nivel: dto.nivel,
    observaciones: dto.observaciones,
  });

  if (!cliente) {
    throw new NotFoundException(`Cliente #${id} no encontrado`);
  }

  const saved = await this.clienteRepo.save(cliente);

  return this.findOne(id);
}


  async remove(id: number) {
    const cliente = await this.findOne(id);
    await this.clienteRepo.remove(cliente);
    return { deleted: true };
  }
}
