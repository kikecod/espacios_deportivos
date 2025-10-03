import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

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

    @Get('/profile')
    @UseGuards(AuthGuard)
    profile(@Req() req: RequestWithUser) {
        console.log(req.user.roles);
        return this.authService.profile(req.user)
        
    }
}
