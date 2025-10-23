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
    const usuario = await this.usuarioRepository.findOneBy({ id_usuario: createUsuarioRolDto.id_usuario });
    const rol = await this.rolRepository.findOneBy({ id_rol: createUsuarioRolDto.id_rol });
    if(!usuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!rol){
      throw new NotFoundException("Rol no encontrado");
    }

    const usuarioRol = this.usuarioRolRepository.create({
      ...createUsuarioRolDto,
      id_usuario: usuario.id_usuario,
      id_rol: rol.id_rol
    })

    return await this.usuarioRolRepository.save(usuarioRol)
  }

  async findAll() {
    return await this.usuarioRolRepository.find();
  }

  async findOne(idU: number, idR: number) {
    const existsUsuario = await this.usuarioRolRepository.exist({where: {id_usuario: idU}});
    const existsRol = await this.usuarioRolRepository.exist({where: {id_rol: idR}});
    if(!existsUsuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!existsRol){
      throw new NotFoundException("Rol no encontrado");
    }

    return await this.usuarioRolRepository.findOne({
      where: {id_usuario: idU, id_rol: idR}
    })
  }

  async update(idU: number, idR: number, updateUsuarioRolDto: UpdateUsuarioRolDto) {
    const existsUsuario = await this.usuarioRolRepository.exist({where: {id_usuario: idU}});
    const existsRol = await this.usuarioRolRepository.exist({where: {id_rol: idR}});
    if(!existsUsuario){
      throw new NotFoundException("Usuario no encontrado");
    }
    if(!existsRol){
      throw new NotFoundException("Rol no encontrado");
    }

    return await this.usuarioRolRepository.update({id_usuario: idU, id_rol: idR,}, updateUsuarioRolDto)
  }

  async restore(idU: number, idR: number){
    const usuarioRol = await this.usuarioRolRepository.findOne({where: {id_usuario: idU, id_rol: idR}, withDeleted: true});
    if (!usuarioRol) {
      throw new NotFoundException("Cancha no encontrada");
    }
    
    usuarioRol.revocado_en = null;
    await this.usuarioRolRepository.save(usuarioRol);
    return await this.usuarioRolRepository.restore({id_usuario: idU, id_rol: idR});
  }

  async remove(idU: number, idR: number): Promise<void> {
    const usuarioRol = await this.usuarioRolRepository.findOne({where: {id_usuario: idU, id_rol: idR}});
    if(!usuarioRol){
      throw new NotFoundException("Usuario-Rol no encontrado");
    }

    usuarioRol.revocado_en = new Date();
    await this.usuarioRolRepository.save(usuarioRol);
    await this.usuarioRolRepository.softRemove(usuarioRol);
  }
}

