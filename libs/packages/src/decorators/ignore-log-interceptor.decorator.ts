import { SetMetadata } from '@nestjs/common';

export const IgnoreLogLogInterceptorSymbolName = Symbol('IgnoreLogLogInterceptorSymbolName');
export const IgnoreLogInterceptor = () => SetMetadata(IgnoreLogLogInterceptorSymbolName, true);
