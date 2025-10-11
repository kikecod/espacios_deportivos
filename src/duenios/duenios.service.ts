// duenios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Duenio } from './entities/duenio.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Rol, TipoRol } from 'src/roles/entities/rol.entity';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';

@Injectable()
export class DueniosService {
  constructor(
    @InjectRepository(Duenio)
    private readonly duenioRepo: Repository<Duenio>,
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDuenioDto) {
    // Crea Duenio ligado a Persona existente (idPersona) o crea la Persona si se envía en dto
    return this.dataSource.transaction(async (manager) => {
      let personaId: number;

      if (dto.idPersona) {
        const persona = await manager.findOne(Persona, { where: { idPersona: dto.idPersona } });
        if (!persona) throw new NotFoundException(`Persona #${dto.idPersona} no encontrada`);
        personaId = persona.idPersona;
      } else if (dto.persona) {
        const personaDto: any = { ...dto.persona };
        if (typeof personaDto.fechaNacimiento === 'string') {
          personaDto.fechaNacimiento = new Date(personaDto.fechaNacimiento);
        }
        const persona = manager.create(Persona, personaDto as any);
        const savedPersona = await manager.save(Persona, persona as any);
        personaId = savedPersona.idPersona;
      } else {
        throw new NotFoundException('Debes enviar idPersona o los datos de persona');
      }

      // evitar duplicados
      const exists = await manager.findOne(Duenio, { where: { idPersonaD: personaId } });
      if (exists) throw new NotFoundException('La persona ya es Duenio');

      const duenio = manager.create(Duenio, {
        idPersonaD: personaId,
        persona: { idPersona: personaId } as Persona,
        verificado: dto.verificado ?? false,
        verificadoEn: dto.verificadoEn ? new Date(dto.verificadoEn) : undefined,
        imagenCi: dto.imagenCi,
        imgfacial: dto.imgfacial,
      } as any);

      await manager.save(Duenio, duenio);

      // Si existe un usuario ligado a la persona, garantizar el rol DUENIO
      const usuario = await manager.findOne(Usuario, { where: { idPersona: personaId } });
      if (usuario) {
        let rolDuenio = await manager.findOne(Rol, { where: { rol: TipoRol.DUENIO } });
        if (!rolDuenio) {
          const nuevoRol = manager.create(Rol, { rol: TipoRol.DUENIO, activo: true });
          rolDuenio = await manager.save(Rol, nuevoRol);
        }

        const existingLink = await manager.findOne(UsuarioRol, {
          where: { idUsuario: usuario.idUsuario, idRol: rolDuenio.idRol },
          withDeleted: true,
        });

        if (!existingLink) {
          const nuevoLink = manager.create(UsuarioRol, {
            idUsuario: usuario.idUsuario,
            idRol: rolDuenio.idRol,
            revocadoEn: null,
          });
          await manager.save(UsuarioRol, nuevoLink);
        } else if (existingLink.eliminadoEn || existingLink.revocadoEn) {
          existingLink.eliminadoEn = null;
          existingLink.revocadoEn = null;
          await manager.save(UsuarioRol, existingLink);
        }
      }

      return manager.findOne(Duenio, {
        where: { idPersonaD: personaId },
        relations: ['persona'],
      });
    });
  }

  findAll() {
    return this.duenioRepo.find({
      relations: ['persona'],
    });
  }

  async findOne(id: number) {
    const duenio = await this.duenioRepo.findOne({
      where: { idPersonaD: id },
      relations: ['persona'],
    });
    if (!duenio) {
      throw new NotFoundException(`Dueño #${id} no encontrado`);
    }
    return duenio;
  }

  async update(id: number, dto: UpdateDuenioDto) {
    // Si viene dto.persona, actualizamos la persona vinculada
    if (dto.persona) {
      const existente = await this.findOne(id);
      const personaDto: any = { ...dto.persona };
      if (typeof personaDto.fechaNacimiento === 'string') {
        personaDto.fechaNacimiento = new Date(personaDto.fechaNacimiento);
      }

      await this.personaRepo.update(existente.persona.idPersona, personaDto);
    }

    // Preload del dueño y merge del resto de campos
    const preload = await this.duenioRepo.preload({
      idPersonaD: id,
      verificado: dto.verificado,
      verificadoEn: dto.verificadoEn ? new Date(dto.verificadoEn) : undefined,
      imagenCi: dto.imagenCi,
      imgfacial: dto.imgfacial,
    });

    if (!preload) {
      throw new NotFoundException(`Dueño #${id} no encontrado`);
    }

    await this.duenioRepo.save(preload);
    // devolver con relaciones actualizadas
    return this.findOne(id);
  }

  async remove(id: number) {
    const duenio = await this.findOne(id);
    await this.duenioRepo.remove(duenio);
    return { deleted: true };
  }
}
