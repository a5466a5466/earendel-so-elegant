import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const mediaCreditSchema = z.object({
	name: z.string().min(1),
	url: z.string().url().optional(),
});

const videoSchema = z.object({
	type: z.enum(['self-hosted', 'youtube']),
	title: z.string().min(1),
	src: z.string().min(1),
	poster: z.string().min(1).optional(),
});

const audioSchema = z.object({
	title: z.string().min(1),
	src: z.string().min(1),
	artist: z.string().min(1).optional(),
});

const socialPostSchema = z.object({
	platform: z.enum(['x', 'threads', 'youtube', 'other']),
	url: z.string().url(),
	label: z.string().min(1),
});

const events = defineCollection({
	loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => {
		const galleryItemSchema = z.object({
			src: image(),
			alt: z.string().min(1),
			caption: z.string().min(1).optional(),
			credit: mediaCreditSchema.optional(),
		});

		return z.object({
			title: z.string().min(1),
			slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
			date: z.coerce.date(),
			summary: z.string().min(10).max(240),
			cover: image(),
			fallbackCover: z.string().startsWith('/lab-assets/events/'),
			coverAlt: z.string().min(1),
			coverPosition: z.string().min(1).default('center'),
			theme: z.string().min(1),
			tags: z.array(z.string().min(1)).min(1),
			gallery: z.array(galleryItemSchema).default([]),
			videos: z.array(videoSchema).default([]),
			audio: z.array(audioSchema).default([]),
			socialPosts: z.array(socialPostSchema).default([]),
			credits: z.array(mediaCreditSchema).min(1),
			featured: z.boolean().default(false),
		});
	},
});

export const collections = { events };
