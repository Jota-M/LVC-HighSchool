declare module 'react-to-print' {
  import * as React from 'react';

  export interface UseReactToPrintOptions {
    content: () => React.ReactInstance | null;
    documentTitle?: string;
    onBeforeGetContent?: () => void | Promise<void>;
    onAfterPrint?: () => void;
    removeAfterPrint?: boolean;
    copyStyles?: boolean;
    pageStyle?: string | ((page: number) => string);
  }

  export function useReactToPrint(options: UseReactToPrintOptions): () => void;
}
