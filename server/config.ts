import 'dotenv/config';

export interface AppConfig {
  dashscopeApiKey: string;
  azureSpeechKey: string;
  azureSpeechRegion: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  port: number;
  corsOrigin: string;
  nodeEnv: string;
  isProduction: boolean;
}

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const config: AppConfig = {
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY ?? '',
  azureSpeechKey: process.env.AZURE_SPEECH_KEY ?? '',
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  port: parsePort(process.env.PORT, 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  nodeEnv,
  isProduction: nodeEnv === 'production',
};

if (!config.dashscopeApiKey) {
  console.warn(
    '[config] DASHSCOPE_API_KEY is not set. AI replies will fall back to safe canned responses until a key is provided in .env',
  );
}

if (!config.azureSpeechKey || !config.azureSpeechRegion) {
  console.warn(
    '[config] AZURE_SPEECH_KEY / AZURE_SPEECH_REGION not set. Voice replies will fall back to the browser\'s built-in TTS.',
  );
}

if (!config.jwtSecret) {
  if (config.isProduction) {
    throw new Error(
      '[config] FATAL: JWT_SECRET is not set. The server cannot start in production without a secure secret.',
    );
  }
  console.warn(
    '[config] JWT_SECRET is not set. Authentication endpoints will be disabled until a secret is provided in .env',
  );
}

export default config;
