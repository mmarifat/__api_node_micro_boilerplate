/************* start client result *********************/
interface BrowserResult {
    type: string;
    name: string;
    version: string;
    engine: string;
    engineVersion: string;
}

interface FeedReaderResult {
    type: string;
    name: string;
    version: string;
    url: string;
}

interface LibraryResult {
    type: string;
    name: string;
    version: string;
    url: string;
}

interface MediaPlayerResult {
    type: string;
    name: string;
    version: string;
}

interface MobileAppResult {
    type: string;
    name: string;
    version: string;
}

interface PersonalInformationManagerResult {
    type: string;
    name: string;
    version: string;
}

declare type ClientResult =
    | FeedReaderResult
    | LibraryResult
    | MediaPlayerResult
    | MobileAppResult
    | PersonalInformationManagerResult
    | BrowserResult
    | null;
/************* end client result *********************/

/************* start device result *********************/
declare type DeviceResult = GenericDeviceResult | null;

declare type DeviceType =
    | ''
    | 'desktop'
    | 'smartphone'
    | 'tablet'
    | 'television'
    | 'smart display'
    | 'camera'
    | 'car'
    | 'console'
    | 'portable media player'
    | 'phablet'
    | 'wearable'
    | 'smart speaker'
    | 'feature phone';

interface GenericDeviceResult {
    type: DeviceType;
    brand: string;
    model: string;
}

/************* end device result *********************/

/************* start os result *********************/
interface OperatingSystemResult {
    name: string;
    version: string;
    platform: 'ARM' | 'x64' | 'x86' | '';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type Result = OperatingSystemResult | null;
/************* end os result *********************/

/************* start bot result *********************/
type DeviceDetectorBotResult = BotResult | null;

interface BotResult {
    name: string;
    category: string;
    url: string;
    producer: {
        name: string;
        url: string;
    };
}

/************* end bot result *********************/
export class DeviceInfoDto {
    client: ClientResult;
    device: DeviceResult;
    os: OperatingSystemResult;
    bot: DeviceDetectorBotResult;
}
