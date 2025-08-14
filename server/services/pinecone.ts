import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey || !indexName) {
  throw new Error('Missing Pinecone environment variables');
}

const pinecone = new Pinecone({
  apiKey
});

const index = pinecone.Index(indexName);

export async function upsertVector(id: string, values: number[], metadata: Record<string, any>) {
  await index.upsert([
    {
      id,
      values,
      metadata,
    },
  ]);
}

export async function queryVector(values: number[], topK: number = 5, filter?: Record<string, any>) {
  const result = await index.query({
    vector: values,
    topK,
    includeMetadata: true,
    filter,
  });
  return result.matches || [];
}
