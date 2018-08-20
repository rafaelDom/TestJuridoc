import * as Application from '@singleware/application';
import { Callable } from './types';
import { Settings } from './settings';
import { Input } from './input';
import { Output } from './output';
/**
 * Back-end application class.
 */
export declare class Main extends Application.Main<Input, Output> {
    /**
     * Application settings.
     */
    protected settings: Settings;
    /**
     * Process event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    protected process(match: Application.Match<Input, Output>, callback: Callable): Promise<void>;
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings: Settings);
}
