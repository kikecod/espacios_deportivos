import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { Roles } from './decorators/roles.decorators';
import { RolesGuard } from './guard/roles.guard';
import { TipoRol } from 'src/roles/rol.entity';
import { Auth } from './decorators/auth.decorators';

interface RequestWithUser extends Request {
    user:{
        correo: string;
        roles: string[];
    }
}

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('/register')
    register(@Body() registerDTO: RegisterDto) {
        return this.authService.register(registerDTO);
    }

    @Post('/login')
    login(@Body() loginDTO: LoginDto) {
        return this.authService.login(loginDTO);
    }

    /*
    @Get('/profile')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([TipoRol.ADMIN])
    profile(@Req() req: RequestWithUser) {
        return this.authService.profile(req.user)
    }*/

    @Get('/profile')
    @Auth([TipoRol.ADMIN])
    profile(@Req() req: RequestWithUser) {
        return this.authService.profile(req.user)
    }
}
