const z = require('zod');

const ChunkSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(z.object({
    code: z.string(),
    explanation: z.string()
  })).default([]),
  tags: z.array(z.string()).default([])
}).strict();

const ChunkResponseSchema = z.object({
  reasoningAndPlanning: z.array(z.string()).default([]),
  chunks: z.array(ChunkSchema)
}).strict();

module.exports = { ChunkSchema, ChunkResponseSchema }; 