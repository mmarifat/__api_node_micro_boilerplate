import { FieldErrorDto } from './field-error.dto';
import { SystemErrorDto } from './system-error.dto';

export class ErrorDto {
    constructor(public fields?: FieldErrorDto[], public system?: SystemErrorDto) {}
}
