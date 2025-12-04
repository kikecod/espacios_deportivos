import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { Trabaja } from './entities/trabaja.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Rol, TipoRol } from 'src/roles/rol.entity';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { CreateUsuarioRolDto } from 'src/usuario_rol/dto/create-usuario_rol.dto';
import { ControladorService } from 'src/controlador/controlador.service';

@Injectable()
export class TrabajaService {
  constructor(
    @InjectRepository(Trabaja)
    private readonly trabajaRepository: Repository<Trabaja>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    private readonly usuarioRolService: UsuarioRolService,
    private readonly controladorService: ControladorService
  ) { }

  async create(createTrabajaDto: CreateTrabajaDto): Promise<Trabaja> {
    const { idPersonaOpe, idSede } = createTrabajaDto;

    // 1. Verificar si existe asignación a esta sede específica
    const existeAsignacion = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede },
    });

    // Si existe y está activa
    if (existeAsignacion?.activo) {
      throw new ConflictException(
        `El controlador ${idPersonaOpe} ya está asignado a la sede ${idSede}`
      );
    }

    // Si existe pero está inactiva, reactivarla
    if (existeAsignacion && !existeAsignacion.activo) {
      existeAsignacion.activo = true;
      existeAsignacion.asignadoDesde = createTrabajaDto['asignadoDesde'] || new Date();
      existeAsignacion.asignadoHasta = createTrabajaDto['asignadoHasta'];

      // Reactivar controlador si está inactivo
      const controlador = await this.controladorService.findByPersona(idPersonaOpe);
      if (controlador && !controlador.activo) {
        await this.controladorService.reactivar(idPersonaOpe);
      }

      // Asegurar que tiene el rol
      await this.asignarRolControlador(idPersonaOpe);

      return this.trabajaRepository.save(existeAsignacion);
    }

    // 2. Verificar que el controlador existe
    const controlador = await this.controladorService.findByPersona(idPersonaOpe);

    if (!controlador) {
      throw new NotFoundException(
        `La persona ${idPersonaOpe} no está registrada como controlador. Créelo primero en /controlador`
      );
    }

    // Si el controlador está inactivo, reactivarlo
    if (!controlador.activo) {
      await this.controladorService.reactivar(idPersonaOpe);
    }

    // 3. Asignar rol CONTROLADOR
    await this.asignarRolControlador(idPersonaOpe);

    // 4. Crear nueva asignación
    const entity = this.trabajaRepository.create({
      idPersonaOpe,
      idSede,
      activo: true,
      asignadoDesde: createTrabajaDto['asignadoDesde'],
      asignadoHasta: createTrabajaDto['asignadoHasta'],
    });

    return this.trabajaRepository.save(entity);
  }

  private async asignarRolControlador(idPersonaOpe: number): Promise<void> {
    const rol = await this.rolRepository.findOneBy({ rol: TipoRol.CONTROLADOR });
    if (!rol) {
      throw new NotFoundException("Rol de controlador no encontrado");
    }

    const persona = await this.personaRepository.findOneBy({ idPersona: idPersonaOpe });
    if (!persona) {
      throw new NotFoundException("Persona no encontrada");
    }

    const usuario = await this.usuarioRepository.findOneBy({ idPersona: persona.idPersona });
    if (!usuario) {
      throw new NotFoundException("Usuario asociado a la persona no encontrado");
    }

    try {
      await this.usuarioRolService.create({
        idUsuario: usuario.idUsuario,
        idRol: rol.idRol
      });
      console.log(`✅ Rol CONTROLADOR asignado al usuario ${usuario.idUsuario}`);
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        throw error;
      }
      console.log(`ℹ️ Usuario ${usuario.idUsuario} ya tiene rol CONTROLADOR`);
    }
  }

  findAll(): Promise<Trabaja[]> {
    return this.trabajaRepository.find({
      relations: ['controlador', 'controlador.persona', 'controlador.persona.usuario', 'sede'],
      where: { activo: true },
    });
  }

  async findOne(idPersonaOpe: number, idSede: number): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede, activo: true },
      relations: ['controlador', 'sede'],
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }
    return trabajo;
  }

  /**
   * No tiene sentido actualizar claves primarias compuestas; se deja para compatibilidad pero no cambia PK.
   */
  async update(idPersonaOpe: number, idSede: number, updateTrabajaDto: UpdateTrabajaDto): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede },
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }

    // Si intentan cambiar las claves, validar duplicado y luego guardar como nuevo estado.
    if (
      updateTrabajaDto.idPersonaOpe !== undefined &&
      updateTrabajaDto.idSede !== undefined &&
      (updateTrabajaDto.idPersonaOpe !== idPersonaOpe || updateTrabajaDto.idSede !== idSede)
    ) {
      const duplicate = await this.trabajaRepository.findOne({
        where: {
          idPersonaOpe: updateTrabajaDto.idPersonaOpe,
          idSede: updateTrabajaDto.idSede,
        },
      });
      if (duplicate) {
        throw new ConflictException('La asignación ya existe');
      }
      // eliminar la antigua y crear la nueva
      await this.trabajaRepository.delete({ idPersonaOpe, idSede });
      const newEntity = this.trabajaRepository.create({
        idPersonaOpe: updateTrabajaDto.idPersonaOpe,
        idSede: updateTrabajaDto.idSede,
        asignadoDesde: updateTrabajaDto['asignadoDesde'],
        asignadoHasta: updateTrabajaDto['asignadoHasta'],
      });
      return this.trabajaRepository.save(newEntity);
    }

    // No hay cambios en PK; simplemente devolver la relación actual
    return trabajo;
  }

  async remove(idPersonaOpe: number, idSede: number): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede, activo: true },
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }
    trabajo.activo = false;
    await this.trabajaRepository.save(trabajo);

    const otrasSedesActivas = await this.trabajaRepository.count({
      where: {
        idPersonaOpe,
        activo: true,
      }
    })

    if (otrasSedesActivas == 0) {
      const rol = await this.rolRepository.findOneBy({ rol: TipoRol.CONTROLADOR });
      if (rol) {
        const persona = await this.personaRepository.findOneBy({ idPersona: idPersonaOpe });
        if (persona) {
          const usuario = await this.usuarioRepository.findOneBy({ idPersona: persona.idPersona });
          if (usuario) {
            try {
              await this.usuarioRolService.remove(usuario.idUsuario, rol.idRol);
              console.log(`Rol CONTROLADOR removido del usuario ${usuario.idUsuario}`);
            } catch (error) {
              console.log("Error al remover ROL CONTROLADOR:", error.message);
            }
          }
        }
      }

      // Desactivar también el controlador si no tiene asignaciones
      try {
        const controlador = await this.controladorService.findOne(idPersonaOpe, true);
        if (controlador && controlador.activo) {
          await this.controladorService.remove(idPersonaOpe);
          console.log(`Controlador ${idPersonaOpe} desactivado (sin asignaciones)`);
        }
      } catch (error) {
        console.log("Error al desactivar controlador:", error.message);
      }
    }
    return trabajo;
  }
}
