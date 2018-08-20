import { Component } from './component';
import { Properties } from './properties';
/**
 * Provides methods that helps with DOM.
 */
export declare class Helper {
    /**
     * Renderer for temporary elements.
     */
    private static renderer;
    /**
     * Creates an element with the specified type.
     * @param type Component type or native element type.
     * @param properties Element properties.
     * @param children Element children.
     */
    static create(type: string | Component, properties: Properties, ...children: any[]): JSX.Element;
    /**
     * Appends the specified children into the specified parent element.
     * @param parent Parent element.
     * @param children Children elements.
     * @returns Returns the parent element.
     */
    static append(element: HTMLElement | ShadowRoot, ...children: any[]): HTMLElement | ShadowRoot;
    /**
     * Clear all children of the specified element.
     * @param element Element instance.
     * @returns Returns the cleared element instance.
     */
    static clear(element: HTMLElement): HTMLElement;
    /**
     * Creates a new component with the specified type.
     * @param type Component type.
     * @param properties Component properties.
     * @param children Component children.
     * @returns Returns the component instance.
     */
    private static createFromComponent;
    /**
     * Creates a native element with the specified type.
     * @param type Element type.
     * @param properties Element properties.
     * @param children Element children.
     * @returns Returns the element instance.
     */
    private static createFromElement;
}
