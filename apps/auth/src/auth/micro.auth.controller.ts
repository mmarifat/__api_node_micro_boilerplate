import { Controller, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MicroAuthService } from '@auth/src/auth/micro.auth.service';
import { ForgotPasswordEmailDto, HcaptchaTokenDto, LoginDto, UserDto } from '@packages/dto/auth';
import { ENUMS } from '@packages/enums';
import { JwtRpcRequest } from '@packages/interfaces';
import { RpcAtGuard, RpcRtGuard } from '@packages/guards/rpc';
import AUTH_MICRO_EVENT = ENUMS.MICROSERVICE.AUTH_MICRO_EVENT;

@Controller('micro-auth')
export class MicroAuthController {
    constructor(private readonly microAuthService: MicroAuthService) {}

    @EventPattern(AUTH_MICRO_EVENT.LOGIN)
    async login(@Payload() payload: { loginDto: LoginDto; ip: any }) {
        return await this.microAuthService.login(payload.loginDto, payload.ip);
    }

    @EventPattern(AUTH_MICRO_EVENT.FORGOT_PASSWORD_EMAIL)
    async forgotPasswordEmail(@Payload() forgotPasswordDto: ForgotPasswordEmailDto) {
        return await this.microAuthService.forgotPasswordEmail(forgotPasswordDto);
    }

    @EventPattern(AUTH_MICRO_EVENT.RESET_PASSWORD_EMAIL)
    async resetPasswordEmail(@Payload() payload: { token: string; password: string }) {
        return await this.microAuthService.resetPasswordEmail(payload.token, payload.password);
    }

    @EventPattern(AUTH_MICRO_EVENT.REGISTER)
    async register(@Payload() registerDto: UserDto) {
        return await this.microAuthService.register(registerDto);
    }

    @EventPattern(AUTH_MICRO_EVENT.HCAPTCHA)
    async hcaptchaVerify(@Payload() tokenDto: HcaptchaTokenDto) {
        return await this.microAuthService.hcaptchaVerify(tokenDto.token);
    }

    @EventPattern(AUTH_MICRO_EVENT.ME)
    @UseGuards(RpcAtGuard)
    async getUserInfoFromToken(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.getUserInfo(payload.__jwtUser._id);
    }

    @EventPattern(AUTH_MICRO_EVENT.REFRESH_TOKEN)
    @UseGuards(RpcRtGuard)
    async refreshToken(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.refreshToken(payload.__jwtUser);
    }

    @EventPattern(AUTH_MICRO_EVENT.LOGOUT)
    @UseGuards(RpcAtGuard)
    async logout(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.logout(payload.__jwtUser);
    }

    @EventPattern(AUTH_MICRO_EVENT.GET)
    @UseGuards(RpcAtGuard)
    async getUser(@Payload() payload: JwtRpcRequest) {
        return this.microAuthService.getUserInfo(payload.userId);
    }
    @EventPattern(AUTH_MICRO_EVENT.UPDATE)
    @UseGuards(RpcAtGuard)
    async updateUser(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.updateUser(payload.userId, payload.userDto);
    }

    @EventPattern(AUTH_MICRO_EVENT.POSF)
    @UseGuards(RpcAtGuard)
    async posf(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.posf(payload.page, payload.limit, payload.sort, payload.order, payload.search);
    }

    @EventPattern(AUTH_MICRO_EVENT.REMOVE)
    @UseGuards(RpcAtGuard)
    async remove(@Payload() payload: JwtRpcRequest) {
        return await this.microAuthService.remove(payload.userId);
    }
}
