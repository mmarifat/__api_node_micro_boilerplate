import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { catchError, map } from 'rxjs';
import { RequestService, ResponseService } from '@packages/services';
import { ProfileDto } from '@packages/dto/auth/user/profile.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ENUMS } from '@packages/enums';
import { HttpSystemException } from '@packages/exceptions';
import { HttpDtoValidationPipe, HttpMongoidValidationPipe } from '@packages/exceptions/http/pipes';
import MicroserviceEnum = ENUMS.MICROSERVICE.MicroserviceEnum;
import AUTH_MICRO_EVENT = ENUMS.MICROSERVICE.AUTH_MICRO_EVENT;

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(
        @Inject(MicroserviceEnum.AUTH) private authClient: ClientProxy,
        private readonly responseService: ResponseService,
        private readonly requestService: RequestService,
    ) {}

    @ApiOperation({ summary: 'at-close' })
    @HttpCode(HttpStatus.OK)
    @Get()
    async get(@Query('profileId', new HttpMongoidValidationPipe()) profileId: string) {
        return this.authClient.send(AUTH_MICRO_EVENT.PROFILE_GET, { profileId, ...this.requestService.appendAtToRpc }).pipe(
            map((res) => {
                return this.responseService.toDtoResponse(HttpStatus.OK, 'Profile Found Successfully', res);
            }),
            catchError((e) => {
                throw new HttpSystemException(e);
            }),
        );
    }

    @ApiOperation({ summary: 'at-close' })
    @HttpCode(HttpStatus.OK)
    @Put()
    async update(
        @Body(
            new HttpDtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: true,
                transform: true,
            }),
        )
        profileDto: ProfileDto,
        @Query('profileId', new HttpMongoidValidationPipe()) profileId: string,
    ) {
        return this.authClient
            .send(AUTH_MICRO_EVENT.PROFILE_UPDATE, {
                profileId,
                profileDto,
                ...this.requestService.appendAtToRpc,
            })
            .pipe(
                map((res) => {
                    return this.responseService.toDtoResponse(HttpStatus.OK, 'Profile Updated Successfully', res);
                }),
                catchError((e) => {
                    throw new HttpSystemException(e);
                }),
            );
    }
}
