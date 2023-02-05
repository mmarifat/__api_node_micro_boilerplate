export namespace ENUMS {
    export enum ValidationTypeEnum {
        DTO = 0,
        MONGOID = 1,
        INT = 2,
        BOOLEAN = 3,
        ARRAY = 4,
    }

    export enum BoolEnum {
        YES = 1,
        NO = 0,
    }

    export enum RedisClientEnum {
        REDIS_SESSION = 'REDIS_SESSION',
    }

    export enum RedisDataEnum {
        RESET_PASSWORD_BLACKLIST = 'RESET_PASSWORD_BLACKLIST',
        ACCESS_TOKEN_BLACKLIST = 'ACCESS_TOKEN_BLACKLIST',
        REFRESH_TOKEN_BLACKLIST = 'REFRESH_TOKEN_BLACKLIST',
    }

    export namespace PROJECT {
        export enum CollectionEnum {
            USERS = 'users',
            PROFILES = 'profiles',
            LOGS = 'logs',
            LOGIN_HISTORIES = 'login_histories',
        }
    }

    export namespace MICROSERVICE {
        export enum MicroserviceEnum {
            AUTH = 'AUTH',
        }
        export enum AUTH_MICRO_EVENT {
            REGISTER = 'auth_micro_event_register',
            LOGIN = 'auth_micro_event_login',
            FORGOT_PASSWORD_EMAIL = 'auth_micro_event_forgot_password_email',
            RESET_PASSWORD_EMAIL = 'auth_micro_event_reset_password_email',
            HCAPTCHA = 'auth_micro_event_hcaptcha',
            ME = 'auth_micro_event_me',
            REFRESH_TOKEN = 'auth_micro_event_refresh_token',
            LOGOUT = 'auth_micro_event_logout',
            GET = 'auth_micro_event_get',
            UPDATE = 'auth_micro_event_update',
            POSF = 'auth_micro_event_posf',
            REMOVE = 'auth_micro_event_remove',

            /// Profile Section /////
            PROFILE_GET = 'auth_micro_event_profile_get',
            PROFILE_UPDATE = 'auth_micro_event_profile_update',
        }
    }
}
