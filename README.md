# Coinspot API

TypeScript + Node wrapper around the CoinSpot REST API https://www.coinspot.com.au/v2/api.

## Installation
NPM
```
npm install @fatton139/coinspot-api
```
PNPM
```
pnpm install @fatton139/coinspot-api
```
Yarn
```
yarn add @fatton139/coinspot-api
```

## Usage

```
import {CoinSpot} from "@fatton139/coinspot-api"

// Grants access to the public API
const publicApi = new CoinSpot()
await publicApi.latestPrices();

// Grants access to the private and readonly API
const privateApi = new CoinSpot("your-api-key", "your-secret")
await privateApi.fullAccessStatusCheck();
```

## Contributing

Contributions are welcome! Open issues and pull requests!

## Licence

This project is licensed under the MIT License - see the LICENSE file for details.