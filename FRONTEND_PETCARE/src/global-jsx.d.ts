import * as React from 'react';

declare global {
  namespace JSX {
    // basic Element typing
    type Element = React.ReactElement<any, any> | null;
    // allow any intrinsic elements to avoid missing types in small project
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
