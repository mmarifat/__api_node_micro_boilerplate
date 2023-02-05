import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Ip, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { catchError, map } from 'rxjs';
import { HttpDtoValidationPipe, HttpIntValidationPipe, HttpMongoidValidationPipe } from '@packages/exceptions/http/pipes';
import { UserDto } from '@packages/dto/auth/user';
import { ForgotPasswordEmailDto, LoginDto } from '@packages/dto/auth';
import { RequestService, ResponseService } from '@packages/services';
import { Public } from '@packages/decorators';
import { HttpRtGuard } from '@packages/guards/http';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { HcaptchaTokenDto } from '@packages/dto/auth/user/user.dto';
import { UserDocument } from '@packages/schemas';
import { ENUMS } from '@packages/enums';
import { HttpSystemException } from '@packages/exceptions/http';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;
import AUTH_MICRO_EVENT = ENUMS.MICROSERVICE.AUTH_MICRO_EVENT;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(MicroserviceEnum.AUTH) private authClient: ClientProxy,
        private readonly requestService: RequestService,
        private readonly responseService: ResponseService,
    ) {}

    @ApiOperation({ summary: 'public' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('register')
    async register(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        registerDto: UserDto,
    ) {
        return this.authClient.send(AUTH_MICRO_EVENT.REGISTER, registerDto).pipe(
            map((res) => {
                return this.responseService.toDtoResponse<UserDocument>(HttpStatus.OK, 'Register is successful', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'public' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        loginDto: LoginDto,
        @Ip() ip: any,
    ) {
        return this.authClient.send(AUTH_MICRO_EVENT.LOGIN, { loginDto, ip }).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, 'Login is successful', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'public' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password-email')
    async forgotPasswordEmail(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        forgotPasswordDto: ForgotPasswordEmailDto,
    ) {
        return this.authClient.send(AUTH_MICRO_EVENT.FORGOT_PASSWORD_EMAIL, forgotPasswordDto).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, 'Password reset link has been sent', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'public' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('reset-password-email')
    async resetPasswordEmail(@Query('token') token: string, @Query('password') password: string) {
        return this.authClient
            .send(AUTH_MICRO_EVENT.RESET_PASSWORD_EMAIL, {
                token,
                password,
            })
            .pipe(
                map((res) => {
                    return this.responseService.toResponse(HttpStatus.OK, 'Password reset successfully', res);
                }),
                catchError((e) => {
                    throw new HttpSystemException(e);
                }),
            );
    }

    @ApiOperation({ summary: 'public' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('hcaptcha')
    async hcaptchaVerify(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        tokenDto: HcaptchaTokenDto,
    ) {
        return this.authClient.send(AUTH_MICRO_EVENT.HCAPTCHA, tokenDto).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, null, res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('me')
    async getUserInfoFromToken() {
        return this.authClient.send(AUTH_MICRO_EVENT.ME, { ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toDtoResponse<UserDocument>(HttpStatus.OK, 'User found', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'rt-close' })
    @ApiBearerAuth()
    @Public()
    @UseGuards(HttpRtGuard)
    @HttpCode(HttpStatus.OK)
    @Get('refresh-token')
    async refreshToken() {
        return this.authClient.send(AUTH_MICRO_EVENT.REFRESH_TOKEN, { ...this.requestService.appendRtToRpc }).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, 'New Access Token Generation is successful', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('logout')
    async logout() {
        return this.authClient.send(AUTH_MICRO_EVENT.LOGOUT, { ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, 'Logout is successful', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('get')
    async getUser(@Query('userId', new HttpMongoidValidationPipe()) userId: string) {
        return this.authClient.send(AUTH_MICRO_EVENT.GET, { userId, ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toDtoResponse<UserDocument>(HttpStatus.OK, 'User found', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Put('update')
    async updateUser(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: true,
                transform: true,
            }),
        )
        userDto: UserDto,
        @Query('userId', new HttpMongoidValidationPipe()) userId: string,
    ) {
        return this.authClient.send(AUTH_MICRO_EVENT.UPDATE, { userId, userDto, ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toDtoResponse<UserDocument>(HttpStatus.OK, 'User updated successfully', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiImplicitQuery({
        name: 'sort',
        required: false,
        type: String,
    })
    @ApiImplicitQuery({
        name: 'order',
        required: false,
        type: String,
    })
    @ApiImplicitQuery({
        name: 'search',
        required: false,
        type: String,
    })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('posf')
    async posf(
        @Query('page', new HttpIntValidationPipe()) page: number,
        @Query('limit', new HttpIntValidationPipe()) limit: number,
        @Query('sort') sort: string,
        @Query('order') order: string,
        @Query('search') search: string,
    ) {
        return this.authClient
            .send(AUTH_MICRO_EVENT.POSF, {
                page,
                limit,
                sort,
                order,
                search,
                ...this.requestService.appendAtToRpc,
            })
            .pipe(
                map((res) => {
                    return this.responseService.toPosfResponse(HttpStatus.OK, 'Users found!', page, limit, res);
                }),
                catchError((e) => {
                    throw new HttpSystemException(e);
                }),
            );
    }

    @ApiOperation({ summary: 'at-close' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Delete('remove')
    async remove(@Query('userId', new HttpMongoidValidationPipe()) userId: string) {
        return this.authClient.send(AUTH_MICRO_EVENT.REMOVE, { userId, ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toResponse(HttpStatus.OK, 'User Removed Successfully', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }
}
