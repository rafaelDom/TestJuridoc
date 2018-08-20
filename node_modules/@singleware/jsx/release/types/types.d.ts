/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Declare all JSX types.
 */
declare namespace JSX {
  /**
   * JSX element interface.
   */
  export interface Element {}

  /**
   * JSX element attributes property.
   */
  export interface ElementAttributesProperty {
    readonly properties: {};
  }

  /**
   * JSX element children attribute.
   */
  export interface ElementChildrenAttribute {
    readonly children: {};
  }

  /**
   * JSX element class.
   */
  export interface ElementClass {
    /**
     * JSX attributes.
     */
    readonly properties: any;
    /**
     * JSX element.
     */
    readonly element: HTMLElement;
  }

  /**
   * JSX native elements.
   */
  export interface IntrinsicElements {
    [name: string]: any;
  }
}
