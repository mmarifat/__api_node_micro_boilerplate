export class FieldErrorDto {
    constructor(public field: string, public value: string, public message: string | string[], public children?: FieldErrorDto[]) {}
}
