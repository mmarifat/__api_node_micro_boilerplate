import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { RpcSystemException } from '@packages/exceptions';
import { ExceptionService, MongoService, RequestService } from '@packages/services';
import { ProfileDto } from '@packages/dto/auth';
import { ProfileDocument, ProfileSchema } from '@packages/schemas';
import { withoutDeletedMongoose } from '@packages/mongo';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

@Injectable()
export class MicroProfileService {
    constructor(
        private readonly mongoModel: MongoService,
        private readonly exceptionService: ExceptionService,
        private readonly requestService: RequestService,
    ) {}

    async getProfile(profileId: string): Promise<any> {
        try {
            const found = await this.mongoModel
                .rpcGetModel<ProfileDocument>({ schema: ProfileSchema, collection: CollectionEnum.PROFILES })
                .findOne({ _id: profileId, ...withoutDeletedMongoose })
                .lean();
            this.exceptionService.rpcNotFound(found, 'Profile not found!!');
            return found;
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }

    async update(profileDto: ProfileDto, profileId: Types.ObjectId | string): Promise<ProfileDocument> {
        try {
            const foundProfile: ProfileDocument = await this.mongoModel
                .rpcGetModel<ProfileDocument>({ schema: ProfileSchema, collection: CollectionEnum.PROFILES })
                .findOne({ _id: profileId, ...withoutDeletedMongoose })
                .lean();

            this.exceptionService.rpcNotFound(foundProfile, 'No Profile found');

            profileDto = this.requestService.updatedBy(null, profileDto);

            return await this.mongoModel
                .rpcGetModel<ProfileDocument>({ schema: ProfileSchema, collection: CollectionEnum.PROFILES })
                .findByIdAndUpdate(profileId, { ...foundProfile, ...profileDto }, { new: true })
                .lean();
        } catch (e) {
            throw new RpcSystemException(e);
        }
    }
}
