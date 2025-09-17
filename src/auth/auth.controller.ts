import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

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
    profile(@Request() req) {
        return req.user;
    }
}
