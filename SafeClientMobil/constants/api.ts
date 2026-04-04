import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Vem do eas.json (env.API_BASE_URL por profile) → app.config.js extra.
 * Em dev local, use um arquivo .env ou o valor padrão abaixo.
 */
export const API_BASE_URL: string = extra.apiBaseUrl || 'http://localhost:3000';

/**
 * Secret injetado pelo EAS no momento do build — nunca commitado.
 * Armazenado com: eas secret:create --scope project --name APP_SIGNING_SECRET --value "..."
 * Em dev local: crie um .env com APP_SIGNING_SECRET e use expo-dotenv ou
 * defina manualmente no app.config.js.
 */
export const APP_SIGNING_SECRET: string = extra.appSigningSecret || '';

/**
 * Chave de acesso para /contacts/lookup (server-to-server).
 * Injetada pelo EAS: eas secret:create --scope project --name CONTACTS_API_KEY --value "..."
 * Mesmo valor configurado em CONTACTS_API_KEY na SafeClient API.
 */
export const CONTACTS_API_KEY: string = extra.contactsApiKey || '';
