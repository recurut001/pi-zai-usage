# Pi coding agent Z.ai, DeepSeek, and OpenAI Codex Usage Extension

A [Pi coding agent](https://pi.dev/) extension that monitors [Z.ai subscription](https://z.ai/subscribe) API token usage quota, DeepSeek API balance, and OpenAI Codex subscription usage, then automatically displays usage in the first footer/statusline when using the matching provider.

![screenshot](./screenshot.png)

## Features

- **Auto Footer Display**: Automatically shows usage in the first footer/statusline when using Z.ai, DeepSeek, or OpenAI Codex models
- **Smart Caching**: Caches usage data for 30 seconds to avoid excessive API calls
- **Z.ai Time Tracking**: Displays remaining time until quota reset for 5-hour, weekly, and monthly quotas
- **DeepSeek Balance Tracking**: Displays positive USD/CNY credit; if both currencies are zero, displays both in red
- **OpenAI Codex Usage Tracking**: Displays 5-hour and weekly Codex usage with reset times

## Install

Published package: <https://www.npmjs.com/package/@beyona/pi-zai-usage>

### Install as a Pi extension from npm

```bash
pi install npm:@beyona/pi-zai-usage
```

The package declares its Pi extension entry point in `package.json`, so `pi install` adds the package to your Pi configuration and loads the extension automatically in new Pi sessions. When using a Z.ai, DeepSeek, or OpenAI Codex model, the first footer/statusline displays usage after session start, model selection, and each turn.

### Update the installed extension

```bash
pi install npm:@beyona/pi-zai-usage@latest
```

Restart Pi or run `/reload` in an existing session after updating.

### Install from a local checkout

If you prefer to build and keep a source checkout locally, clone your fork and run:

```bash
# Install dependencies
bun install

# Build the extension
bun run build

# Install the extension
pi install ./
```

## Development

This project uses modern TypeScript development tooling:

- **Bun** - Fast package manager and runtime
- **TypeScript 6** - Static type checking with strict mode enabled
- **Biome** - Ultra-fast linter and formatter

```bash
# Type check
bun run typecheck

# Lint code
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format code
bun run format

# Run all checks
bun run check

# Watch mode for development
bun run dev
```

## Usage

### Automatic Footer Display

When using a Z.ai model (e.g., `glm-4.7`, `glm-5`, `glm-5-flash`), the extension displays the Z.ai quotas right-aligned on the first statusline:

```
Z.ai: 5h 100% (2h 18m) · W 34% (1d 2h 44m) · M 4% (10d 2h 44m)
```

When using a DeepSeek model, the extension displays DeepSeek credit on the same first statusline. It only shows currencies with positive credit. If both USD and CNY are zero, it shows both in red:

```
DeepSeek: $6.23
DeepSeek: $0.00 ¥0.00
```

When using an OpenAI Codex model (`openai-codex` provider), the extension displays Codex usage in the same 5-hour/week shape as Z.ai, without a monthly quota:

```
Codex: 5h 41% (12:30) · W 39% (09:15 on 21 May)
```

The footer updates after each AI turn and on model selection changes.

## Configuration

No configuration needed. The extension automatically:
- Uses cached data for 30 seconds to avoid excessive API calls
- Shows/updates status only when Z.ai, DeepSeek, or OpenAI Codex models are active
- Clears status when switching to other providers

## API

The extension uses these provider API endpoints:

- Z.ai: `https://api.z.ai/api/monitor/usage/quota/limit`
- DeepSeek: `https://api.deepseek.com/user/balance`
- OpenAI Codex: `https://chatgpt.com/backend-api/wham/usage`

Make sure you're logged in to the provider via Pi (for example, `/login for Z.ai`).

## Releasing

This project uses automated publishing to NPM via GitHub Actions. The workflow will:
- Run all CI checks
- Build the package
- Publish to NPM via [trusted publishing](https://docs.npmjs.com/trusted-publishers) (without provenance while this repository is private)

## Redistribution notes

Current redistribution progress:

- `@beyona/pi-zai-usage` is published publicly on npm.
- The source repository uses `main` as the default branch.
- The package vendors the helper code formerly provided by `@alexanderfortin/pi-usage-lib`, the DeepSeek balance logic formerly provided by `@alexanderfortin/pi-deepseek-usage`, and bundled Codex usage logic based on `@narumitw/pi-codex-usage`.
- The package has no runtime dependencies.

The vendored helper code and original Z.ai/DeepSeek extensions are MIT-licensed by Alexander Fortin. The Codex reference package is MIT-licensed by narumitw.

## License

MIT
