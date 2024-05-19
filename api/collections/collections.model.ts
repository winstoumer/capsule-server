// collections.model.ts

import { sql } from '../database';

interface CollectionData {
    id: number;
    name: string;
    total_nft: number;
    logo_url?: string;
    banner_url?: string;
    date: Date;
    active: boolean;
}

async function getActiveCollections(): Promise<CollectionData[]> {
    return await sql<CollectionData[]>`
      SELECT * FROM nft_collections WHERE active = true
    `;
  }

async function getCollectionById(id: number): Promise<CollectionData | null> {
    const result = await sql<CollectionData[]>`
      SELECT * FROM nft_collections WHERE id = ${id} AND active = true
    `;
    return result[0] || null;
}

export { getActiveCollections, getCollectionById, CollectionData };