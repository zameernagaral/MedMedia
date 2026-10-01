import { z } from 'zod';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5001),
  DATABASE_URL: z.string()
    .min(1, 'DATABASE_URL is required')
    .refine(value => value.startsWith('mysql://') || value.startsWith('mysql2://'), 'DATABASE_URL must use MySQL')
    .default(isProduction ? '' : 'mysql://root:password@127.0.0.1:3306/medmedia_dev'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security').default(isProduction ? '' : randomBytes(32).toString('hex')),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default(isProduction ? '' : 'http://localhost:3000,http://127.0.0.1:3000'),
  CLOUDINARY_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  USE_REDIS: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  REDIS_PASSWORD: z.string().optional(),
}).superRefine((values, ctx) => {
  if (isProduction && values.USE_REDIS && !values.REDIS_URL && !values.REDIS_HOST) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['REDIS_URL'],
      message: 'Set REDIS_URL or REDIS_HOST when USE_REDIS=true in production'
    });
  }
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;

process.env.PORT ??= String(env.PORT);
process.env.DATABASE_URL ??= env.DATABASE_URL;
process.env.JWT_SECRET ??= env.JWT_SECRET;
process.env.USE_REDIS ??= String(env.USE_REDIS);
