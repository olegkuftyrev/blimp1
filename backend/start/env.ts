/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const),

  /**
   * App metadata and URLs
   */
  APP_NAME: Env.schema.string.optional(),
  APP_URL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | CORS and security
  |----------------------------------------------------------
  */
  CORS_ORIGIN: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Optional Postgres configuration
  |----------------------------------------------------------
  */
  // Postgres is the only supported DB now
  PG_HOST: Env.schema.string.optional(),
  PG_PORT: Env.schema.number.optional(),
  PG_USER: Env.schema.string.optional(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string.optional(),
  PG_SSL: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Websocket / Realtime
  |----------------------------------------------------------
  */
  WS_CORS_ORIGIN: Env.schema.string.optional(),
})
