// src/content.config.ts — Schema Zod + glob loader para projetos
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    tagline: z.string().max(90),
    family: z.enum(['jogos', 'dados', 'web', 'visao']),
    year: z.number().int().min(2000).max(2100),
    status: z.enum(['enviado', 'em-obras', 'arquivado']).default('enviado'),
    tech: z.array(z.string()).min(1),
    links: z.object({
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
    }),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    arcaneNote: z.string().max(140).optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { projects };