import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const optionalNumberEnv = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().max(max).min(min).optional(),
  );

export const getToolsConfig = () => {
  return createEnv({
    runtimeEnv: {
      CRAWL_CONCURRENCY: process.env.CRAWL_CONCURRENCY,
      CRAWLER_RETRY: process.env.CRAWLER_RETRY,
      CRAWLER_IMPLS: process.env.CRAWLER_IMPLS,
      DISABLE_TOOL_DISCOVERY: process.env.DISABLE_TOOL_DISCOVERY,
      SEARCH_PROVIDERS: process.env.SEARCH_PROVIDERS,
      SEARXNG_URL: process.env.SEARXNG_URL,
      VISUAL_UNDERSTANDING_MODEL: process.env.VISUAL_UNDERSTANDING_MODEL,
      VISUAL_UNDERSTANDING_PROVIDER: process.env.VISUAL_UNDERSTANDING_PROVIDER,
    },

    server: {
      CRAWL_CONCURRENCY: optionalNumberEnv(1, 10),
      CRAWLER_RETRY: optionalNumberEnv(0, 3),
      CRAWLER_IMPLS: z.string().optional(),
      /**
       * When set to '1', disables the tool discovery system entirely:
       * - The lobe-activator, lobe-skills, and lobe-skill-store tools are removed
       * - The available tools list is not injected into the system prompt
       * - The AI agent cannot dynamically activate tools at runtime
       */
      DISABLE_TOOL_DISCOVERY: z
        .string()
        .optional()
        .transform((v) => v === '1'),
      SEARCH_PROVIDERS: z.string().optional(),
      SEARXNG_URL: z.string().url().optional(),
      VISUAL_UNDERSTANDING_MODEL: z.string().optional(),
      VISUAL_UNDERSTANDING_PROVIDER: z.string().optional(),
    },
  });
};

export const toolsEnv = getToolsConfig();
