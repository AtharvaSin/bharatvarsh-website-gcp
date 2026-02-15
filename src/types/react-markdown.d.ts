/**
 * Augment the global scope with a JSX namespace so that
 * react-markdown v8's internal types compile under newer
 * @types/react (v19+) where the global JSX namespace was removed.
 *
 * This is a well-known compatibility shim — safe to remove once
 * react-markdown is upgraded to v9+.
 */

import type { JSX as ReactJSX } from 'react';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements extends ReactJSX.IntrinsicElements { }
    }
}
