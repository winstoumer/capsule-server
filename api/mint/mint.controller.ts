// mint.controller.ts
import { Request, Response } from 'express';
import { insertNftMinted } from './mint.model';

export const addNftMinted = async (req: Request, res: Response): Promise<void> => {
    const { telegram_id, nft_id, address, send_ton, collection_id } = req.body;
  
    try {
      const id = await insertNftMinted({
        telegram_id,
        nft_id,
        address,
        send_ton,
        collection_id,
        active: true
      });
  
      res.status(201).json({ id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };