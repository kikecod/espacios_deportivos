import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioRolDto } from './dto/create-usuario_rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario_rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioRol } from './entities/usuario_rol.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Rol } from 'src/roles/rol.entity';

@Injectable()
export class UsuarioRolService {

  constructor(
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>
  ){}

  async create(createUsuarioRolDto: CreateUsuarioRolDto) {
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario: createUsuarioRolDto.idUsuario });
    const rol = await this.rolRepository.findOneBy({ idRol: createUsuarioRolDto.idRol });
    if(!usuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!rol){
      throw new NotFoundException("Rol no encontrado");
    }

    const usuarioRol = this.usuarioRolRepository.create({
      ...createUsuarioRolDto,
      idUsuario: usuario.idUsuario,
      idRol: rol.idRol
    })

    return await this.usuarioRolRepository.save(usuarioRol)
  }

  async findAll() {
    return await this.usuarioRolRepository.find();
  }

  async findOne(idU: number, idR: number) {
    const existsUsuario = await this.usuarioRolRepository.exist({where: {idUsuario: idU}});
    const existsRol = await this.usuarioRolRepository.exist({where: {idRol: idR}});
    if(!existsUsuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!existsRol){
      throw new NotFoundException("Rol no encontrado");
    }

    return await this.usuarioRolRepository.findOne({
      where: {idUsuario: idU, idRol: idR}
    })
  }

  async update(idU: number, idR: number, updateUsuarioRolDto: UpdateUsuarioRolDto) {
    const existsUsuario = await this.usuarioRolRepository.exist({where: {idUsuario: idU}});
    const existsRol = await this.usuarioRolRepository.exist({where: {idRol: idR}});
    if(!existsUsuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!existsRol){
      throw new NotFoundException("Rol no encontrado");
    }

    return await this.usuarioRolRepository.update({idUsuario: idU, idRol: idR,}, updateUsuarioRolDto)
  }

  async restore(idU: number, idR: number){
    const usuarioRol = await this.usuarioRolRepository.findOne({where: {idUsuario: idU, idRol: idR}, withDeleted: true});
    if (!usuarioRol) {
      throw new NotFoundException("Cancha no encontrada");
    }
    
    usuarioRol.revocadoEn = null;
    await this.usuarioRolRepository.save(usuarioRol);
    return await this.usuarioRolRepository.restore({idUsuario: idU, idRol: idR});
  }

  async remove(idU: number, idR: number): Promise<void> {
    const usuarioRol = await this.usuarioRolRepository.findOne({where: {idUsuario: idU, idRol: idR}});
    if(!usuarioRol){
      throw new NotFoundException("Usuario-Rol no encontrado");
    }

    usuarioRol.revocadoEn = new Date();
    await this.usuarioRolRepository.save(usuarioRol);
    await this.usuarioRolRepository.softRemove(usuarioRol);
  }
}
