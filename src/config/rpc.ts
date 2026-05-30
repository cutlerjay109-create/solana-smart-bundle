import { Connection, Commitment } from '@solana/web3.js';
import { config } from './index';

export const createConnection = (commitment: Commitment = 'confirmed'): Connection => {
  return new Connection(config.rpc.url, {
    commitment,
    wsEndpoint: config.rpc.websocketUrl,
  });
};

export const createDevnetConnection = (commitment: Commitment = 'confirmed'): Connection => {
  return new Connection('https://api.devnet.solana.com', {
    commitment,
  });
};
