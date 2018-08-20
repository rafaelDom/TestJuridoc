import { Callback } from './types';
/**
 * Control helper class.
 */
export declare class Helper {
    /**
     * List all children that contains the expected property in the element slot and executes the given callback for each result.
     * @param slot Element slot.
     * @param property Expected property.
     * @param callback Callback to be executed for each element found.
     * @returns Returns the same value returned by the callback or undefined if the callback returns nothing.
     */
    static listChildByProperty(slot: HTMLSlotElement, property: PropertyKey, callback: Callback): any;
    /**
     * Gets the first child that contains the expected property from the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the first child or undefined when there is no child found.
     */
    static getChildByProperty(slot: HTMLSlotElement, property: PropertyKey): HTMLElement | undefined;
    /**
     * Gets the property value from the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the property value or undefined when there is no child found.
     */
    static getChildProperty(slot: HTMLSlotElement, property: PropertyKey): any;
    /**
     * Sets the specified property value to all elements in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     */
    static setChildrenProperty(slot: HTMLSlotElement, property: PropertyKey, value: any): void;
    /**
     * Sets the property value into the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     * @returns Returns true when the child was found and updated, false otherwise.
     */
    static setChildProperty(slot: HTMLSlotElement, property: PropertyKey, value: any): boolean;
    /**
     * Assign all values mapped by the specified keys into the target object.
     * @param target Target object.
     * @param values Values to be assigned.
     * @param keys Keys to be assigned.
     */
    static assignProperties(target: Object, values: Object, keys: string[]): void;
}
