import { Controller, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ENUMS } from '@packages/enums';
import { MicroProfileService } from '@auth/src/profile/micro.profile.service';
import { HttpSystemException } from '@packages/exceptions';
import { RpcAtGuard } from '@packages/guards/rpc';
import { JwtRpcRequest } from '@packages/interfaces';
import AUTH_MICRO_EVENT = ENUMS.MICROSERVICE.AUTH_MICRO_EVENT;

@Controller('micro-profile')
@UseGuards(RpcAtGuard)
export class MicroProfileController {
    constructor(private readonly microProfileService: MicroProfileService) {}

    @EventPattern(AUTH_MICRO_EVENT.PROFILE_GET)
    async profileGet(@Payload() payload: JwtRpcRequest) {
        try {
            return await this.microProfileService.getProfile(payload.profileId);
        } catch (e) {
            throw new HttpSystemException(e);
        }
    }

    @EventPattern(AUTH_MICRO_EVENT.PROFILE_UPDATE)
    async profileUpdate(@Payload() payload: JwtRpcRequest) {
        try {
            return await this.microProfileService.update(payload.profileDto, payload.profileId);
        } catch (e) {
            throw new HttpSystemException(e);
        }
    }
}
