/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
export { Main } from './main';
export { Match } from './types';
export { Response } from './response';
export { Input } from './input';
export { Output } from './output';
import * as ServicesModule from './services';
export declare const Services: typeof ServicesModule;
import * as HandlersModule from './handlers';
export declare const Handlers: typeof HandlersModule;
