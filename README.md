# The Boiling Point

A new era for vibe-coded apps.

The Boiling Point is a new crowdfund launchpad, powered by the TokenLayer protocol.
Launch on Ethereum, let the crowd validate your idea, then open trading across major chains.

## Back to Ethereum. Back to belief.

Strangers once funded revolutions here. Now they fund you, $10k at a time.

- Ethereum at the core
- Powered by the crowd
- Distributed everywhere through TokenLayer rails

## How It Works

1. Create a coin for your vibe-coded MVP and include a demo link.
2. The crowd backs your campaign during the bonding-curve phase.
3. On graduation, creator rewards unlock and trading expands across liquid chains.

Graduation target:
- Graduates at `$100,000` USDT market cap (about `$26,400` raised)
- Creator receives `$10,000` USDT
- `$15,000` USDT is seeded as Ethereum liquidity on Uniswap

## BoilingPoint Economics

- 4% fee discount for launchers and traders onboarded via BoilingPoint
- BoilingPoint earns protocol-fee share at no extra cost to users
- Generated fees are directed to `$BISK` buybacks

## Why TokenLayer Protocol

- Multi-chain token lifecycle from launch to post-graduation trading
- Action endpoints for token creation and execution flows
- Info endpoints for token discovery and quote flows
- Builder/referral primitives via `BUILDER_CODE`, `BUILDER_FEE_BPS`, and `NEXT_PUBLIC_REF_ADDRESS`

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Set at least one server auth method:

- `TOKEN_LAYER_PRIVATE_KEY` (preferred)
- `TOKEN_LAYER_API_KEY`

Common config:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_INITIAL_CHAIN` (default: `base`)
- `NEXT_PUBLIC_DESTINATION_CHAINS` (default: `solana,ethereum,bnb`)
- `BUILDER_CODE`
- `BUILDER_FEE_BPS`
- `NEXT_PUBLIC_REF_ADDRESS`
- `NEXT_PUBLIC_FEATURED_TOKEN_ID`
- `TOKEN_LAYER_API_URL` (optional override)
- `TOKEN_LAYER_AUTH_CHAIN_ID` and `TOKEN_LAYER_AUTH_RPC_URL`

See [.env.example](./.env.example) for full values and examples.

## TokenLayer Integration Points

- `src/lib/token-layer.ts`: TokenLayer SDK client setup (wallet or API key auth)
- `src/app/api/tokens/create-token-endpoint/route.ts`: create-token action endpoint
- `src/app/api/tokens/route.ts`: token list and filtering endpoint
- `src/app/api/tokens/quote-token/route.ts`: quote endpoint used for launch-time buy estimates

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Links

- X: [@BoilingPoint_tl](https://x.com/BoilingPoint_tl)
- TokenLayer: [tokenlayer.network](https://tokenlayer.network)
- OpenClaw: [openclaw.ai](https://openclaw.ai)
- Repo: [Token-Layer/openclaw-launchpad](https://github.com/Token-Layer/openclaw-launchpad)
