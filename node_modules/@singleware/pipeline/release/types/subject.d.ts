import * as Observable from '@singleware/observable';
/**
 * Generic subject class.
 */
export declare class Subject<T> extends Observable.Subject<T> {
    /**
     * Notify the first registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyFirstSync(value: T): Subject<T>;
    /**
     * Notify the first registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    notifyFirst(value: T): Promise<Subject<T>>;
    /**
     * Notify the last registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyLastSync(value: T): Subject<T>;
    /**
     * Notify the last registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    notifyLast(value: T): Promise<Subject<T>>;
}
