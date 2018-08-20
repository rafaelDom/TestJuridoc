/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Access control headers interface.
 */
export interface Access {
  /**
   * Determines whether the credentials must be provided or not.
   */
  credentials: boolean;
  /**
   * Allowed origin.
   */
  origin?: string;
  /**
   * Allowed methods.
   */
  methods?: string | string[];
  /**
   * Allowed headers.
   */
  headers?: string | string[];
}
