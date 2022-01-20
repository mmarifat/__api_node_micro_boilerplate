import { MongooseModule } from '@nestjs/mongoose';
import { CollectionEnum } from '../../package/enums/collection.enum';
import { Module } from '@nestjs/common';
import { UserAuthController } from './controller/user-auth.controller';
import { UserAuthService } from './services/user-auth.service';
import UserAuthSchema, { UserAuthEntity } from '../../package/colllections/schemas/user-auth.schema';
import LoginHistorySchema, { LoginHistoryEntity } from '../../package/colllections/schemas/login-history.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserAuthEntity.name,
                schema: UserAuthSchema,
                collection: CollectionEnum.USER_AUTHS,
            },
            {
                name: LoginHistoryEntity.name,
                schema: LoginHistorySchema,
                collection: CollectionEnum.LOGIN_HISTORIES,
            },
        ]),
    ],
    controllers: [UserAuthController],
    providers: [UserAuthService],
})
export class UserAuthModule {}
