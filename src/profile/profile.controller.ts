import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService, ExportDataResult } from './profile.service';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { TipoRol } from 'src/roles/rol.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  getProfile(@ActiveUser() user: any) {
    return this.profileService.getProfile(user);
  }

  @Put('personal')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  updatePersonal(
    @ActiveUser() user: any,
    @Body() dto: UpdatePersonalInfoDto,
  ) {
    return this.profileService.updatePersonalInfo(user, dto);
  }

  @Put('preferences')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  updatePreferences(
    @ActiveUser() user: any,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.profileService.updatePreferences(user, dto);
  }

  @Post('avatar')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @ActiveUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo válido.');
    }
    return this.profileService.updateAvatar(user, file);
  }

  @Delete('avatar')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  removeAvatar(@ActiveUser() user: any) {
    return this.profileService.removeAvatar(user);
  }

  @Put('password')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  changePassword(
    @ActiveUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user, dto);
  }

  @Post('email/request')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  requestEmailChange(
    @ActiveUser() user: any,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.profileService.requestEmailChange(user, dto);
  }

  @Post('email/verify')
  verifyEmailChange(@Body() dto: VerifyEmailDto) {
    return this.profileService.verifyEmailChange(dto);
  }

  @Post('export')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  exportData(@ActiveUser() user: any): Promise<ExportDataResult> {
    return this.profileService.exportData(user);
  }

  @Post('deactivate')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  deactivateAccount(
    @ActiveUser() user: any,
    @Body() dto: DeactivateAccountDto,
  ) {
    return this.profileService.deactivateAccount(user, dto);
  }

  @Post('delete')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  deleteAccount(
    @ActiveUser() user: any,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.profileService.deleteAccount(user, dto);
  }
}
