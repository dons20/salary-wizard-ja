/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	readonly VITE_EXCHANGE_RATE_API_URL?: string
	readonly VITE_ANALYZE_BUNDLE?: boolean
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}