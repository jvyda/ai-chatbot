import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

import {
	user,
	chat,
	type User,
	document,
	type Suggestion,
	suggestion,
	type Message,
	message,
	vote,
	apiServices, apiKeys, type ApiService, type ApiKey, ApiServiceWithKeys,
	systemPrompts,
	imageGeneration, generatedImage, type ImageGeneration, type GeneratedImage
} from './schema';
import { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.email, email));
	} catch (error) {
		console.error('Failed to get user from database');
		throw error;
	}
}

export async function createUser(email: string, password: string) {
	const salt = genSaltSync(10);
	const hash = hashSync(password, salt);

	try {
		return await db.insert(user).values({ email, password: hash });
	} catch (error) {
		console.error('Failed to create user in database');
		throw error;
	}
}

export async function saveChat({
	id,
	userId,
	title,
  	systemPromptId,
}: {
	id: string;
	userId: string;
	title: string;
  	systemPromptId?: string
}) {
	try {
		return await db.insert(chat).values({
			id,
			createdAt: new Date(),
			userId,
			title,
      		systemPromptId,
		});
	} catch (error) {
		console.error('Failed to save chat in database');
		throw error;
	}
}

export async function deleteChatById({ id }: { id: string }) {
	try {
		await db.delete(vote).where(eq(vote.chatId, id));
		await db.delete(message).where(eq(message.chatId, id));

		return await db.delete(chat).where(eq(chat.id, id));
	} catch (error) {
		console.error('Failed to delete chat by id from database');
		throw error;
	}
}

export async function getChatsByUserId({ id }: { id: string }) {
	try {
		return await db
			.select()
			.from(chat)
			.where(eq(chat.userId, id))
			.orderBy(desc(chat.createdAt));
	} catch (error) {
		console.error('Failed to get chats by user from database');
		throw error;
	}
}

export async function getChatById({ id }: { id: string }) {
	try {
		const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
		return selectedChat;
	} catch (error) {
		console.error('Failed to get chat by id from database');
		throw error;
	}
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
	try {
		return await db.insert(message).values(messages);
	} catch (error) {
		console.error('Failed to save messages in database', error);
		throw error;
	}
}

export async function getMessagesByChatId({ id }: { id: string }) {
	try {
		return await db
			.select()
			.from(message)
			.where(eq(message.chatId, id))
			.orderBy(asc(message.createdAt));
	} catch (error) {
		console.error('Failed to get messages by chat id from database', error);
		throw error;
	}
}

export async function voteMessage({
	chatId,
	messageId,
	type,
}: {
	chatId: string;
	messageId: string;
	type: 'up' | 'down';
}) {
	try {
		const [existingVote] = await db
			.select()
			.from(vote)
			.where(and(eq(vote.messageId, messageId)));

		if (existingVote) {
			return await db
				.update(vote)
				.set({ isUpvoted: type === 'up' })
				.where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
		}
		return await db.insert(vote).values({
			chatId,
			messageId,
			isUpvoted: type === 'up',
		});
	} catch (error) {
		console.error('Failed to upvote message in database', error);
		throw error;
	}
}

export async function getVotesByChatId({ id }: { id: string }) {
	try {
		return await db.select().from(vote).where(eq(vote.chatId, id));
	} catch (error) {
		console.error('Failed to get votes by chat id from database', error);
		throw error;
	}
}

export async function saveDocument({
	id,
	title,
	kind,
	content,
	userId,
	systemPromptId
}: {
	id: string;
	title: string;
	kind: ArtifactKind;
	content: string;
	userId: string;
	systemPromptId?: string
}) {
	try {
		return await db.insert(document).values({
			id,
			title,
			kind,
			content,
			userId,
			createdAt: new Date(),
			systemPromptId
		});
	} catch (error) {
		console.error('Failed to save document in database');
		throw error;
	}
}

export async function getDocumentsById({ id }: { id: string }) {
	try {
		const documents = await db
			.select()
			.from(document)
			.where(eq(document.id, id))
			.orderBy(asc(document.createdAt));

		return documents;
	} catch (error) {
		console.error('Failed to get document by id from database');
		throw error;
	}
}

export async function getDocumentById({ id }: { id: string }) {
	try {
		const [selectedDocument] = await db
			.select()
			.from(document)
			.where(eq(document.id, id))
			.orderBy(desc(document.createdAt));

		return selectedDocument;
	} catch (error) {
		console.error('Failed to get document by id from database');
		throw error;
	}
}

export async function deleteDocumentsByIdAfterTimestamp({
	id,
	timestamp,
}: {
	id: string;
	timestamp: Date;
}) {
	try {
		await db
			.delete(suggestion)
			.where(
				and(
					eq(suggestion.documentId, id),
					gt(suggestion.documentCreatedAt, timestamp),
				),
			);

		return await db
			.delete(document)
			.where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
	} catch (error) {
		console.error(
			'Failed to delete documents by id after timestamp from database',
		);
		throw error;
	}
}

export async function saveSuggestions({
	suggestions,
}: {
	suggestions: Array<Suggestion>;
}) {
	try {
		return await db.insert(suggestion).values(suggestions);
	} catch (error) {
		console.error('Failed to save suggestions in database');
		throw error;
	}
}

export async function getSuggestionsByDocumentId({
	documentId,
}: {
	documentId: string;
}) {
	try {
		return await db
			.select()
			.from(suggestion)
			.where(and(eq(suggestion.documentId, documentId)));
	} catch (error) {
		console.error(
			'Failed to get suggestions by document version from database',
		);
		throw error;
	}
}

export async function getMessageById({ id }: { id: string }) {
	try {
		return await db.select().from(message).where(eq(message.id, id));
	} catch (error) {
		console.error('Failed to get message by id from database');
		throw error;
	}
}

export async function deleteMessagesByChatIdAfterTimestamp({
	chatId,
	timestamp,
}: {
	chatId: string;
	timestamp: Date;
}) {
	try {
		const messagesToDelete = await db
			.select({ id: message.id })
			.from(message)
			.where(
				and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
			);

		const messageIds = messagesToDelete.map((message) => message.id);

		if (messageIds.length > 0) {
			await db
				.delete(vote)
				.where(
					and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
				);

			return await db
				.delete(message)
				.where(
					and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
				);
		}
	} catch (error) {
		console.error(
			'Failed to delete messages by id after timestamp from database',
		);
		throw error;
	}
}

export async function updateChatVisiblityById({
	chatId,
	visibility,
}: {
	chatId: string;
	visibility: 'private' | 'public';
}) {
	try {
		return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
	} catch (error) {
		console.error('Failed to update chat visibility in database');
		throw error;
	}
}

export async function getApiServices(): Promise<Array<ApiService>> {
	try {
		return await db.select().from(apiServices);
	} catch (error) {
		console.error('Failed to get API services from database');
		throw error;
	}
}

export async function getApiKeysByServiceId({
	serviceId,
	userId
}: {
	serviceId: string;
	userId: string;
}): Promise<Array<ApiKey>> {
	try {
		return await db
			.select()
			.from(apiKeys)
			.where(
				and(
					eq(apiKeys.serviceId, serviceId),
					eq(apiKeys.userId, userId)
				)
			)
			.orderBy(desc(apiKeys.createdAt));
	} catch (error) {
		console.error('Failed to get API keys from database');
		throw error;
	}
}

export async function getApiKeys({ userId }: { userId: string }) {
	try {
		return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId))
	} catch (error) {
		console.error('Failed to get API keys from database')
		throw error
	}
}

export async function addApiKey({
	serviceId,
	userId,
	key,
	name,
	status
}: {
	serviceId: string;
	userId: string;
	key: string;
	name?: string;
	status?: 'active' | 'inactive';
}) {
	try {
		// First deactivate all existing keys for this service and user
		await db
			.update(apiKeys)
			.set({ status: 'inactive' })
			.where(
				and(
					eq(apiKeys.serviceId, serviceId),
					eq(apiKeys.userId, userId)
				)
			);

		// Then add the new key as active
		return await db
			.insert(apiKeys)
			.values({
				serviceId,
				userId,
				key,
				name,
				status: 'active'
			});
	} catch (error) {
		console.error('Failed to add API key to database');
		throw error;
	}
}

export async function updateApiKeyStatus({
	keyId,
	userId,
	serviceId,
	status
}: {
	keyId: string;
	userId: string;
	serviceId: string;
	status: 'active' | 'inactive';
}) {
	try {
		// First deactivate all keys for this service
		await db
			.update(apiKeys)
			.set({ status: 'inactive' })
			.where(
				and(
					eq(apiKeys.serviceId, serviceId),
					eq(apiKeys.userId, userId)
				)
			);

		// Then activate the selected key
		return await db
			.update(apiKeys)
			.set({ status: status })
			.where(
				and(
					eq(apiKeys.id, keyId),
					eq(apiKeys.userId, userId)
				)
			);
	} catch (error) {
		console.error('Failed to update API key status in database');
		throw error;
	}
}

export async function deleteApiKey({
	keyId,
}: {
	keyId: string;
}) {
	if (!keyId) {
		throw new Error('Invalid key ID provided for deletion');
	}
	try {
		return await db
			.delete(apiKeys)
			.where(
				and(
					eq(apiKeys.id, keyId),
				)
			);
	} catch (error) {
		console.error('Failed to delete API key from database');
		throw error;
	}
}

export async function getApiServicesWithKeys(
	userId: string
): Promise<ApiServiceWithKeys[]> {
	try {
		const services = await db
			.select({
				id: apiServices.id,
				name: apiServices.name,
				wordLimit: apiServices.wordLimit,
				createdAt: apiServices.createdAt,
				updatedAt: apiServices.updatedAt,
				keyId: apiKeys.id,
				keyValue: apiKeys.key,
				keyStatus: apiKeys.status,
				keyCreatedAt: apiKeys.createdAt,
				keyLastUsedAt: apiKeys.lastUsedAt,
				keyName: apiKeys.name
			})
			.from(apiServices)
			.leftJoin(
				apiKeys,
				and(
					eq(apiKeys.serviceId, apiServices.id),
					eq(apiKeys.userId, userId)
				)
			)
			.orderBy(asc(apiServices.name), desc(apiKeys.createdAt));

		// Group results into service -> keys structure
		const grouped = services.reduce((acc, row) => {
			if (!acc[row.id]) {
				acc[row.id] = {
					id: row.id,
					name: row.name,
					wordLimit: row.wordLimit,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
					keys: []
				};
			}

			if (row.keyId) {
				acc[row.id].keys.push({
					id: row.keyId,
					key: row.keyValue || '',
					status: row.keyStatus || '',
					createdAt: row.keyCreatedAt || '',
					lastUsedAt: row.keyLastUsedAt,
					serviceId: row.id,
					userId: userId,
					name: row.keyName
				});
			}

			return acc;
		}, {} as Record<string, ApiServiceWithKeys>);

		return Object.values(grouped);

	} catch (error) {
		console.error('Failed to fetch services with keys:', error);
		throw new Error('Failed to fetch services with keys');
	}
}

export async function activateKey({
	keyId,
	userId,
	serviceId
}: {
	keyId: string
	userId: string
	serviceId: string
}) {
	try {
		return await db.transaction(async (tx) => {
			// Deactivate all keys for this service and user
			await tx
				.update(apiKeys)
				.set({ status: 'inactive' })
				.where(
					and(
						eq(apiKeys.serviceId, serviceId),
						eq(apiKeys.userId, userId)
					)
				)

			// Activate the selected key
			const response = await tx
				.update(apiKeys)
				.set({ status: 'active' })
				.where(
					and(
						eq(apiKeys.id, keyId),
						eq(apiKeys.userId, userId)
					)
				)
				.returning();
			if (response.length === 0) {
				return { success: false, message: 'Key not found' };
			}
			return { success: true };
		})
	} catch (error) {
		console.error('Failed to activate API key:', error)
		throw new Error('Failed to activate API key')
	}
}

export async function getSystemPrompts({ userId }: { userId: string }) {
	try {
		return await db
			.select()
			.from(systemPrompts)
			.where(eq(systemPrompts.userId, userId))
			.orderBy(desc(systemPrompts.createdAt));
	} catch (error) {
		console.error('Failed to get chats by user from database');
		throw error;
	}

}

export async function createSystemPrompt({
	userId,
	name,
	prompt,
}: {
	userId: string;
	name: string;
	prompt: string;
}) {
	try {
		return await db.insert(systemPrompts).values({
			userId,
			name,
			prompt,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	} catch (error) {
		console.error('Failed to save system prompt in database');
		throw error;
	}
}

export async function getSystemPromptById({ id }: { id: string }) {
	try {
		return await db.select().from(systemPrompts).where(eq(systemPrompts.id, id));
	} catch (error) {
		console.error('Failed to get system prompt by id from database');
		throw error;
	}
}
export async function deleteSystemPromptById({ id, userId }: { id: string, userId: string }) {
	try {
		return await db.delete(systemPrompts)
		.where(
			and(eq(systemPrompts.id, id), eq(systemPrompts.userId, userId))
		);
	} catch (error) {
		console.error('Failed to delete system prompt by id from database');
		throw error;
	}
}
export async function updateSystemPromptById({ id, userId, name, prompt }: { id: string, userId: string, name: string, prompt: string }) {
	try {
		return await db.update(systemPrompts).set({ name, prompt }).where(and(eq(systemPrompts.id, id), eq(systemPrompts.userId, userId)));
	} catch (error) {
		console.error('Failed to update system prompt by id from database');
		throw error;
	}
}

// Get all generations for a chat
export async function getImageGenerationsByChatId({ chatId }: { chatId: string }) {
	try {
	  return await db
		.select()
		.from(imageGeneration)
		.where(eq(imageGeneration.chatId, chatId))
		.orderBy(desc(imageGeneration.createdAt));
	} catch (error) {
	  console.error('Failed to get image generations by chat id from database');
	  throw error;
	}
  }
  
  // Get a specific generation with its images
  export async function getImageGenerationById({ id }: { id: string }) {
	try {
	  const [generation] = await db
		.select()
		.from(imageGeneration)
		.where(eq(imageGeneration.id, id));
  
	  const images = await db
		.select()
		.from(generatedImage)
		.where(eq(generatedImage.imageGenerationId, id))
		.orderBy(asc(generatedImage.index));
  
	  return { generation, images };
	} catch (error) {
	  console.error('Failed to get image generation by id from database');
	  throw error;
	}
  }
  
  // Get all generations for a specific prompt
  export async function getImageGenerationsByPrompt({ prompt }: { prompt: string }) {
	try {
	  return await db
		.select()
		.from(imageGeneration)
		.where(eq(imageGeneration.originalPrompt, prompt))
		.orderBy(desc(imageGeneration.createdAt));
	} catch (error) {
	  console.error('Failed to get image generations by prompt from database');
	  throw error;
	}
  }
  
  // Get selected images for a generation
  export async function getSelectedImages({ generationId }: { generationId: string }) {
	try {
	  return await db
		.select()
		.from(generatedImage)
		.where(
		  and(
			eq(generatedImage.imageGenerationId, generationId),
			eq(generatedImage.isSelected, true)
		  )
		)
		.orderBy(asc(generatedImage.index));
	} catch (error) {
	  console.error('Failed to get selected images from database');
	  throw error;
	}
  }
  
  // Toggle image selection
  export async function toggleImageSelection({
	imageId,
	isSelected
  }: {
	imageId: string;
	isSelected: boolean;
  }) {
	try {
	  return await db
		.update(generatedImage)
		.set({ isSelected })
		.where(eq(generatedImage.id, imageId))
		.returning();
	} catch (error) {
	  console.error('Failed to toggle image selection in database');
	  throw error;
	}
  }
  
  // Mark a generation as resolved
  export async function resolveImageGeneration({
	generationId,
	isResolved
  }: {
	generationId: string;
	isResolved: boolean;
  }) {
	try {
	  return await db
		.update(imageGeneration)
		.set({ isResolved })
		.where(eq(imageGeneration.id, generationId))
		.returning();
	} catch (error) {
	  console.error('Failed to resolve image generation in database');
	  throw error;
	}
  }
  
  // Delete a generation and its images
  export async function deleteImageGeneration({ id }: { id: string }) {
	try {
	  // First delete associated images
	  await db
		.delete(generatedImage)
		.where(eq(generatedImage.imageGenerationId, id));
  
	  // Then delete the generation
	  return await db
		.delete(imageGeneration)
		.where(eq(imageGeneration.id, id))
		.returning();
	} catch (error) {
	  console.error('Failed to delete image generation from database');
	  throw error;
	}
  }
  
  // Get all generations by user
  export async function getImageGenerationsByUserId({ userId }: { userId: string }) {
	try {
	  return await db
		.select()
		.from(imageGeneration)
		.where(eq(imageGeneration.userId, userId))
		.orderBy(desc(imageGeneration.createdAt));
	} catch (error) {
	  console.error('Failed to get image generations by user from database');
	  throw error;
	}
  }
  
  // Get generations with pending status
  export async function getPendingImageGenerations() {
	try {
	  return await db
		.select()
		.from(imageGeneration)
		.where(eq(imageGeneration.status, 'pending'))
		.orderBy(desc(imageGeneration.createdAt));
	} catch (error) {
	  console.error('Failed to get pending image generations from database');
	  throw error;
	}
  }
  
  // Update generation status
  export async function updateImageGenerationStatus({
	id,
	status,
	error
  }: {
	id: string;
	status: 'pending' | 'completed' | 'failed';
	error?: string;
  }) {
	try {
	  return await db
		.update(imageGeneration)
		.set({
		  status,
		  error,
		  completedAt: status === 'completed' ? new Date() : undefined
		})
		.where(eq(imageGeneration.id, id))
		.returning();
	} catch (error) {
	  console.error('Failed to update image generation status in database');
	  throw error;
	}
  }

export async function createImageGeneration({
	prompt,
	userId,
	chatId,
	messageId,
	segmentText,
	originalPrompt,
	status,
}: {
	prompt: string;
	userId: string;
	chatId: string;
	messageId: string;
	segmentText?: string;
	originalPrompt: string;
	status: 'pending' | 'completed' | 'failed';
}) {
	try {
		const [generation] = await db.insert(imageGeneration).values({
			prompt,
			userId,
			chatId,
			messageId,
			segmentText,
			originalPrompt,
			status,
			createdAt: new Date(),
		}).returning();
		return generation;
	} catch (error) {
		console.error('Failed to create image generation');
		throw error;
	}
}

export async function createGeneratedImage({
	imageGenerationId,
	url,
	blobPath,
	index,
}: {
	imageGenerationId: string;
	url: string;
	blobPath: string;
	index: number;
}) {
	try {
		const [image] = await db.insert(generatedImage).values({
			imageGenerationId,
			url,
			blobPath,
			index,
			createdAt: new Date(),
		}).returning();
		return image;
	} catch (error) {
		console.error('Failed to create generated image');
		throw error;
	}
}


export async function getChatCount({ userId }: { userId: string }) {
	try {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(chat)
			.where(eq(chat.userId, userId));
		
		return result[0].count;
	} catch (error) {
		console.error('Failed to get chat count from database');
		throw error;
	}
}

export async function getSystemPromptsCount({ userId }: { userId: string }) {
	try {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(systemPrompts)
			.where(eq(systemPrompts.userId, userId));
		
		return result[0].count;
	} catch (error) {
		console.error('Failed to get system prompts count from database');
		throw error;
	}
}

export async function getMessageCount({ userId }: { userId: string }) {
	try {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(message)
			.innerJoin(chat, eq(message.chatId, chat.id))
			.where(eq(chat.userId, userId));
		
		return result[0].count;
	} catch (error) {
		console.error('Failed to get message count from database');
		throw error;
	}
}

export async function getRecentChats({ userId, limit }: { userId: string, limit: number }) {
	try {
		return await db
			.select()
			.from(chat)
			.where(eq(chat.userId, userId))
			.orderBy(desc(chat.createdAt))
			.limit(limit);
	} catch (error) {
		console.error('Failed to get recent chats from database');
		throw error;
	}
}

export async function addApiService({
	name,
	wordLimit
}: {
	name: string;
	wordLimit: number;
}) {
	try {
		const [service] = await db
			.insert(apiServices)
			.values({
				name,
				wordLimit,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
		return service;
	} catch (error) {
		console.error('Failed to add API service to database');
		throw error;
	}
}

export async function deleteApiService(serviceId: string) {
	if (!serviceId) {
	  throw new Error('Invalid service ID provided for deletion');
	}
	try {
	  // First delete any associated keys
	  await db
		.delete(apiKeys)
		.where(eq(apiKeys.serviceId, serviceId));
	  
	  // Then delete the service itself
	  return await db
		.delete(apiServices)
		.where(eq(apiServices.id, serviceId));
	} catch (error) {
	  console.error('Failed to delete API service from database');
	  throw error;
	}
  }