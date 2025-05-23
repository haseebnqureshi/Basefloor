import { z } from 'zod'

// Project-wide configuration
export const projectConfigSchema = z.object({
  name: z.string(),
  port: z.number().optional(),
  env: z.enum(['development', 'production', 'test']).optional(),
  domain: z.string().optional(),
  ssl: z.object({
    enabled: z.boolean().optional(),
    cert: z.string().optional(),
    key: z.string().optional()
  }).optional()
})

// Database configuration
export const databaseConfigSchema = z.object({
  uri: z.string(),
  options: z.record(z.any()).optional()
})

// API-specific configuration
export const apiConfigSchema = z.object({
  routes: z.function().optional(),
  models: z.function().optional(),
  auth: z.object({
    jwt: z.object({
      secret: z.string(),
      expiresIn: z.string().optional()
    }).optional(),
    providers: z.record(z.any()).optional()
  }).optional(),
  files: z.object({
    provider: z.string().optional(),
    maxSize: z.number().optional(),
    allowedTypes: z.array(z.string()).optional()
  }).optional(),
  email: z.object({
    provider: z.string(),
    from: z.string(),
    templates: z.record(z.any()).optional()
  }).optional(),
  ai: z.object({
    providers: z.record(z.any()).optional()
  }).optional()
})

// App-specific configuration
export const appConfigSchema = z.object({
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    mode: z.enum(['light', 'dark', 'auto']).optional()
  }).optional(),
  routing: z.object({
    mode: z.enum(['history', 'hash']).optional(),
    base: z.string().optional()
  }).optional(),
  components: z.object({
    prefix: z.string().optional(),
    global: z.array(z.string()).optional()
  }).optional()
})

// Main configuration schema
export const basefloorConfigSchema = z.object({
  project: projectConfigSchema,
  database: databaseConfigSchema.optional(),
  api: apiConfigSchema.optional(),
  app: appConfigSchema.optional(),
  providers: z.record(z.any()).optional()
})

// Export types
export type ProjectConfig = z.infer<typeof projectConfigSchema>
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>
export type ApiConfig = z.infer<typeof apiConfigSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
export type BasefloorConfig = z.infer<typeof basefloorConfigSchema>

// Configuration function type (what the user exports)
export type BasefloorConfigFunction = (API: any) => BasefloorConfig 