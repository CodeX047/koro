import { Pinecone } from '@pinecone-database/pinecone';

import { env } from '~/env';

let pinecone: Pinecone | null = null;

export function getPineconeIndex() {
    if (!pinecone) {
        pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
    }

    return pinecone.index(env.PINECONE_INDEX);
}
