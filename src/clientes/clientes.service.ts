import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';


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

      // Asegurar tipos correctos para la entidad Persona (documentoNumero y telefono son strings en la entidad)
      const personaDto: any = { ...(dto.persona || {}) };
      if (personaDto.documentoNumero !== undefined && typeof personaDto.documentoNumero === 'number') {
        personaDto.documentoNumero = String(personaDto.documentoNumero);
      }
      if (personaDto.telefono !== undefined && typeof personaDto.telefono === 'number') {
        personaDto.telefono = String(personaDto.telefono);
      }

      const persona = manager.create(Persona, personaDto);
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

    const personaDto: any = { ...dto.persona };
    if (personaDto.documentoNumero !== undefined && typeof personaDto.documentoNumero === 'number') {
      personaDto.documentoNumero = String(personaDto.documentoNumero);
    }
    if (personaDto.telefono !== undefined && typeof personaDto.telefono === 'number') {
      personaDto.telefono = String(personaDto.telefono);
    }

    await this.personaRepo.update(personaId, personaDto);
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

  async isOwner(idUsuario: number, idCliente: number): Promise<boolean> {
  // Busca el cliente y compara su persona/usuario con el idUsuario del token
    const cliente = await this.clienteRepo.findOne({ where: { idCliente }, relations: ['persona', 'persona.usuario'] });
    return !!cliente && cliente.persona?.usuario?.idUsuario === idUsuario;
  }

  async findByUsuarioId(idUsuario: number) {
    return this.clienteRepo
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.persona', 'p')
      .innerJoin(Usuario, 'u', 'u.idPersona = p.idPersona')
      .where('u.idUsuario = :idUsuario', { idUsuario })
      .getOne();
  }



}
