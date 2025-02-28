import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
    systemPromptId: text(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet', 'imageprompt'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const apiServices = pgTable('api_services', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  wordLimit: integer('word_limit').notNull().default(10000),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ApiService = InferSelectModel<typeof apiServices>;

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => apiServices.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  name: varchar('name', { length: 256 }),
  status: varchar('status', { length: 32 }).notNull().default('inactive'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
});

export type ApiKey = InferSelectModel<typeof apiKeys>;

// Add relationships for better type safety with Drizzle
export const apiServicesRelations = relations(apiServices, ({ many }) => ({
  keys: many(apiKeys),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  service: one(apiServices, {
    fields: [apiKeys.serviceId],
    references: [apiServices.id],
  }),
  user: one(user, {
    fields: [apiKeys.userId],
    references: [user.id],
  }),
}));

export const apiKeyServices = pgTable(
  'api_key_services',
  {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  keyId: uuid('key_id')
    .notNull()
    .references(() => apiKeys.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => apiServices.id, { onDelete: 'cascade' }),
  wordsUsed: integer('words_used').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ApiKeyServices = InferSelectModel<typeof apiKeyServices>;

export type ApiServiceWithKeys = InferSelectModel<typeof apiServices> & {
  keys: ApiKey[]
}

// Add System Prompts Table
export const systemPrompts = pgTable(
	'system_prompts',
	{
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  name: varchar('name', { length: 256 }).notNull().unique(),
  prompt: text('prompt').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type SystemPrompts = InferSelectModel<typeof systemPrompts>;


export const imageGeneration = pgTable('ImageGeneration', {
  id: uuid('id').notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  prompt: text('prompt').notNull(),
  segmentText: text('segmentText'),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  messageId: uuid('messageId')
    .notNull()
    .references(() => message.id),
  originalPrompt: text('originalPrompt').notNull(),
  description: text('description'),
  isResolved: boolean('isResolved').notNull().default(false),
  status: varchar('status', { 
    enum: ['pending', 'completed', 'failed'] 
  }).notNull().default('pending'),
  error: text('error'),
  completedAt: timestamp('completedAt'),
  seed: integer('seed'),
  metadata: json('metadata'),
}, (table) => ({
  pk: primaryKey({ columns: [table.id] }),
}));

export type ImageGeneration = InferSelectModel<typeof imageGeneration>;

export const generatedImage = pgTable('GeneratedImage', {
  id: uuid('id').notNull().defaultRandom(),
  imageGenerationId: uuid('imageGenerationId')
    .notNull()
    .references(() => imageGeneration.id),
  url: text('url').notNull(),
  blobPath: text('blobPath').notNull(),
  index: integer('index').notNull(),
  isSelected: boolean('isSelected').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.id] }),
}));

export type GeneratedImage = InferSelectModel<typeof generatedImage>;

// Simple relations
export const imageGenerationRelations = relations(imageGeneration, ({ one, many }) => ({
  user: one(user, {
    fields: [imageGeneration.userId],
    references: [user.id],
  }),
  chat: one(chat, {
    fields: [imageGeneration.chatId],
    references: [chat.id],
  }),
  message: one(message, {
    fields: [imageGeneration.messageId],
    references: [message.id],
  }),
  images: many(generatedImage),
}));

export const generatedImageRelations = relations(generatedImage, ({ one }) => ({
  generation: one(imageGeneration, {
    fields: [generatedImage.imageGenerationId],
    references: [imageGeneration.id],
  }),
}));