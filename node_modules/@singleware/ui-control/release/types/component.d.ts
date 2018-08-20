import { Properties } from './properties';
/**
 * Control component class.
 */
export declare class Component<T extends Properties> implements JSX.ElementClass {
    /**
     * Component properties.
     */
    readonly properties: T;
    /**
     * Component children.
     */
    protected readonly children: any[];
    /**
     * Binds the specified descriptor from the given prototype to be called with the current access rules.
     * @param prototype Source prototype.
     * @param property Property name.
     * @returns Returns a new property descriptor.
     * @throws Throws an error when the specified property was not found.
     */
    protected bindDescriptor(prototype: Object, property: PropertyKey): PropertyDescriptor;
    /**
     * Default constructor.
     * @param properties Initial properties.
     * @param children Initial children.
     */
    constructor(properties?: T, children?: any[]);
    /**
     * Get control instance.
     */
    readonly element: HTMLElement;
}
