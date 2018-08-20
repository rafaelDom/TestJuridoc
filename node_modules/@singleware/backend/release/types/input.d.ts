/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Headers } from './headers';

/**
 * Application input interface.
 */
export interface Input {
  /**
   * Request method.
   */
  method: string;
  /**
   * Request address.
   */
  address: string;
  /**
   * Request headers.
   */
  headers: Headers;
  /**
   * Request data.
   */
  data: string;
}
