import {Toaster} from '@gravity-ui/uikit';

// A single shared instance rather than just the useToaster() hook's context
// value - this needs to be reachable from plain modules (services/api.js's
// response interceptor) that render no React tree of their own.
export const toaster = new Toaster();
