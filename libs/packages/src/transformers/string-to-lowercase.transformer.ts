import { ValueTransformer } from 'typeorm';
export class StringToLowercaseTransformer implements ValueTransformer {
    from = (v) => v;
    to = (v) => (v || '').toLowerCase();
}
