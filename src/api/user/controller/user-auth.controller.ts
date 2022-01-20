import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserAuthService } from '../services/user-auth.service';
import { LoginDto } from '../../../package/dtos/login.dto';
import { UserAuthDto } from '../../../package/colllections/dtos/user-auth.dto';
import { DtoValidationPipe } from '../../../package/exceptions/pipes/dto-validation.pipe';
import { ResponseService } from '../../../package/services/response.service';

@ApiTags('User Auth')
@Controller('user-auth')
export class UserAuthController {
    constructor(private readonly userService: UserAuthService, private readonly responseService: ResponseService) {}

    @Post('login')
    async login(
        @Body(
            new DtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        loginDto: LoginDto,
    ) {
        const login = this.userService.login(loginDto);
        return this.responseService.toResponse(HttpStatus.OK, 'Login is successful', login);
    }

    @Post('register')
    async register(
        @Body(
            new DtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        registerDto: UserAuthDto,
    ) {
        const registeredUser = this.userService.register(registerDto);
        return this.responseService.toResponse(HttpStatus.OK, 'Register is successful', registeredUser);
    }
}
