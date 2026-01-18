import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'identity/index': 'src/identity/index.ts',
    'recovery/index': 'src/recovery/index.ts',
    'transfer/index': 'src/transfer/index.ts',
    'shielded/index': 'src/shielded/index.ts',
    'tokens/index': 'src/tokens/index.ts',
    'dex/index': 'src/dex/index.ts',
    'wallet-adapter/index': 'src/wallet-adapter/index.ts',
    'voting/index': 'src/voting/index.ts',
    'multisig/index': 'src/multisig/index.ts',
    'staking/index': 'src/staking/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@solana/web3.js'],
});

