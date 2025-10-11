import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Controlador } from './entities/controlador.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Rol, TipoRol } from 'src/roles/entities/rol.entity';

@Injectable()
export class ControladorService {
  constructor(
    @InjectRepository(Controlador)
    private readonly controladorRepository: Repository<Controlador>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createControladorDto: CreateControladorDto) {
    return this.dataSource.transaction(async (manager) => {
      const persona = await manager.findOne(Persona, { where: { idPersona: createControladorDto.idPersonaOpe } });
      if (!persona) {
        throw new NotFoundException(`Persona #${createControladorDto.idPersonaOpe} no encontrada`);
      }

      const exists = await manager.findOne(Controlador, { where: { idPersonaOpe: createControladorDto.idPersonaOpe } });
      if (exists) {
        throw new ConflictException('La persona ya es Controlador');
      }

      const controlador = manager.create(Controlador, {
        idPersonaOpe: createControladorDto.idPersonaOpe,
        persona,
        codigoEmpleado: createControladorDto.codigoEmpleado,
        activo: createControladorDto.activo ?? true,
        turno: createControladorDto.turno,
      });
      await manager.save(Controlador, controlador);

      const usuario = await manager.findOne(Usuario, { where: { idPersona: createControladorDto.idPersonaOpe } });
      if (usuario) {
        let rolControlador = await manager.findOne(Rol, { where: { rol: TipoRol.CONTROLADOR } });
        if (!rolControlador) {
          rolControlador = await manager.save(Rol, manager.create(Rol, { rol: TipoRol.CONTROLADOR, activo: true }));
        }

        const existingLink = await manager.findOne(UsuarioRol, {
          where: { idUsuario: usuario.idUsuario, idRol: rolControlador.idRol },
          withDeleted: true,
        });

        if (!existingLink) {
          await manager.save(
            UsuarioRol,
            manager.create(UsuarioRol, {
              idUsuario: usuario.idUsuario,
              idRol: rolControlador.idRol,
              revocadoEn: null,
            }),
          );
        } else if (existingLink.eliminadoEn || existingLink.revocadoEn) {
          existingLink.eliminadoEn = null;
          existingLink.revocadoEn = null;
          await manager.save(UsuarioRol, existingLink);
        }
      }

      return manager.findOne(Controlador, {
        where: { idPersonaOpe: createControladorDto.idPersonaOpe },
        relations: ['persona'],
      });
    });
  }

  findAll(): Promise<Controlador[]> {
    return this.controladorRepository.find({ relations: ['persona'] });
  }

  async findOne(id: number): Promise<Controlador> {
    const controlador = await this.controladorRepository.findOne({
      where: { idPersonaOpe: id },
      relations: ['persona'],
    });

    if (!controlador) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado.`);
    }
    return controlador;
  }

  async update(id: number, updateControladorDto: UpdateControladorDto) {
    const result = await this.controladorRepository.update({ idPersonaOpe: id }, updateControladorDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado para actualizar.`);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const deleteResult = await this.controladorRepository.delete({ idPersonaOpe: id });

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado para eliminar.`);
    }

    return { message: `Controlador con ID ${id} eliminado exitosamente.` };
  }
}
