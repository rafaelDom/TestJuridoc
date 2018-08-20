/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Headers } from './headers';

/**
 * Application output interface.
 */
export interface Output {
  /**
   * Response status.
   */
  status: number;
  /**
   * Response message.
   */
  message: string;
  /**
   * Response headers.
   */
  headers: Headers;
  /**
   * Response data.
   */
  data: string | Buffer;
}
