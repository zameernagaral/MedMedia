import { z } from 'zod';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5001'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default(isProduction ? '' : 'file:./dev.db'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security').default(isProduction ? '' : randomBytes(32).toString('hex')),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLOUDINARY_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;

process.env.DATABASE_URL ??= env.DATABASE_URL;
process.env.JWT_SECRET ??= env.JWT_SECRET;
