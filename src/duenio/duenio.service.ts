import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Duenio } from './entities/duenio.entity';
import { Repository } from 'typeorm';
import { Persona } from 'src/personas/entities/personas.entity';
import { NotFoundError } from 'rxjs';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Rol, TipoRol } from 'src/roles/rol.entity';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { CreateUsuarioRolDto } from 'src/usuario_rol/dto/create-usuario_rol.dto';

@Injectable()
export class DuenioService {

  constructor(
    @InjectRepository(Duenio)
    private readonly duenioRepository: Repository<Duenio>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    private readonly usuarioRolService: UsuarioRolService
  ){}

  async create(createDuenioDto: CreateDuenioDto): Promise<Duenio> {
    const rol = await this.rolRepository.findOneBy({rol: TipoRol.DUENIO});
    if(!rol){
      throw new NotFoundException("Rol no encontrado");
    }

    const persona = await this.personaRepository.findOneBy({id_persona: createDuenioDto.id_persona_d});
    if(!persona){
      throw new NotFoundException("Persona no encontrada");
    }

    const usuario = await this.usuarioRepository.findOneBy({id_persona: persona?.id_persona});
    if(!usuario){
      throw new NotFoundException("Usuario asociado a la persona no encontrado");
    }
    
    const dto: CreateUsuarioRolDto = {
      id_usuario: usuario.id_usuario,
      id_rol: rol.id_rol
    };

    await this.usuarioRolService.create(dto);
  
    const duenio = this.duenioRepository.create({
      ...createDuenioDto,
      id_persona_d: persona.id_persona
    });

    return this.duenioRepository.save(duenio);

  }

  async findAll() {
    return await this.duenioRepository.find();
  }

  async findOne(id: number) {
    const exsit = await this.duenioRepository.exists({where: {id_persona_d: id}});
    if(!exsit){
      throw new NotFoundException("Dueño no encontrado")
    }
    return await this.duenioRepository.findOneBy({id_persona_d: id})
  }

  async update(id: number, updateDuenioDto: UpdateDuenioDto) {
    const exsit = await this.duenioRepository.exists({where: {id_persona_d: id}});
    if(!exsit){
      throw new NotFoundException("Dueño no encontrado")
    }
    return await this.duenioRepository.update(id, updateDuenioDto);
  }

  async restore(id: number){
    const exists = await this.duenioRepository.exist({ where: { id_persona_d: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.duenioRepository.restore(id);
  }

  async remove(id: number) {
    const exsit = await this.duenioRepository.exists({where: {id_persona_d: id}});
    if(!exsit){
      throw new NotFoundException("Dueño no encontrado")
    }
    return await this.duenioRepository.softDelete(id);
  }
}
