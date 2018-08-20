/// <reference types="node" />
import { MIMEs } from '../../mimes';
import { Output } from '../../output';
import { Match } from '../../types';
import { Settings } from './settings';
/**
 * Default file handler class.
 */
export declare class Default {
    /**
     * Handler settings.
     */
    private settings;
    /**
     * Gets the MIME type that corresponds to the extension of the specified file.
     * @param path File path.
     * @returns Returns the corresponding MIME type or undefined when the type was not found.
     */
    protected getMimeType(path: string): string | undefined;
    /**
     * Read all content of the specified file.
     * @param path File path.
     * @returns Returns the file content.
     */
    protected readFile(path: string): Promise<Buffer>;
    /**
     * Test whether the specified file exists or not.
     * @param path File path.
     * @returns Returns the promise to get true when the file exists or false otherwise.
     */
    protected fileExists(path: string): Promise<boolean>;
    /**
     * Set the content of a default error file into the give output response.
     * @param output Output response.
     * @param status Output status.
     * @param information Error information.
     */
    protected setResponseError(output: Output, status: number, information: string): Promise<void>;
    /**
     * Set the content of the specified file into the given output response.
     * @param output Output response.
     * @param path File path.
     */
    protected setResponseFile(output: Output, path: string): Promise<void>;
    /**
     * Default constructor.
     * @param settings Handler settings.
     */
    constructor(settings: Settings);
    /**
     * Exception response processor.
     * @param match Matched rote.
     */
    exceptionResponse(match: Match): Promise<void>;
    /**
     * Default response processor.
     * @param match Matched rote.
     */
    defaultResponse(match: Match): Promise<void>;
    /**
     * Get base directory.
     */
    readonly directory: string;
    /**
     * Get index file.
     */
    readonly index: string;
    /**
     * Get strict status.
     */
    readonly strict: boolean;
    /**
     * Get handler types.
     */
    readonly types: MIMEs;
    /**
     * Assets path.
     */
    private static assetsPath;
}
