import { Observer } from './observer';
/**
 * Generic subject class.
 */
export declare class Subject<T> {
    /**
     * List of observers.
     */
    protected observers: Array<Observer<T>>;
    /**
     * Number of registered observers.
     */
    readonly length: number;
    /**
     * Subscribes the specified source into the subject.
     * @param source Source instance.
     * @returns Returns the own instance.
     */
    subscribe(source: Observer<T> | Subject<T>): Subject<T>;
    /**
     * Determines whether the subject contains the specified observer or not.
     * @param observer Observer instance.
     * @returns Returns true when the observer was found, false otherwise.
     */
    contains(observer: Observer<T>): boolean;
    /**
     * Unsubscribes the specified observer from the subject.
     * @param observer Observer instance.
     * @returns Returns true when the observer was removed, false when the observer does not exists in the subject.
     */
    unsubscribe(observer: Observer<T>): boolean;
    /**
     * Notify all registered observers.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyAllSync(value: T): Subject<T>;
    /**
     * Notify all registered observers asynchronously.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    notifyAll(value: T): Promise<Subject<T>>;
    /**
     * Notify all registered observers step by step with an iterator.
     * @param value Notification value.
     * @returns Returns a new notification iterator.
     */
    notifyStep(value: T): IterableIterator<Subject<T>>;
}
