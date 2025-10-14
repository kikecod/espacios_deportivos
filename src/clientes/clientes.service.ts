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
  ) {}

  async create(dto: CreateClienteDto) {
    const persona = await this.personaRepo.findOneBy({ idPersona: dto.idCliente });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const cliente = this.clienteRepo.create({
      ...dto,
      idCliente: persona.idPersona,
    });

    return this.clienteRepo.save(cliente);
  }

  findAll() {
    return this.clienteRepo.find();
  }

  async findOne(id: number) {
    const exsit = await this.clienteRepo.exists({where: {idCliente: id}});
    if(!exsit){
      throw new NotFoundException("Cliente no encontrado")
    }
    return await this.clienteRepo.findOneBy({idCliente: id})
  }

  async update(id: number, dto: UpdateClienteDto) {
    const exsit = await this.clienteRepo.exists({where: {idCliente: id}});
    if(!exsit){
      throw new NotFoundException("Cliente no encontrado")
    }
    return await this.clienteRepo.update(id, dto);
}


  async remove(id: number) {
    const exsit = await this.clienteRepo.exists({where: {idCliente: id}});
    if(!exsit){
      throw new NotFoundException("Cliente no encontrado")
    }
    await this.clienteRepo.delete({idCliente: id});
  }
}
