/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ADMIN_PASSWORD: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
