/// <reference types="vite/client" />

declare module '*.css';
declare module '*.scss';
declare module '*.svg';
declare module '*.png';

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
