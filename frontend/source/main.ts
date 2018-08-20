/**
 * Copyright (C) 2018 Juridoc
 * Frontend client.
 */
import * as Frontend from '@singleware/frontend';
import * as Default from './handler';

// Main application instance.
export const application = new Frontend.Main({});

// Setup the browser service.
application.addService(Frontend.Services.Client, {});

// Setup all page handlers.
application.addHandler(Default.Handler);

// Starts actions.
application.start();
