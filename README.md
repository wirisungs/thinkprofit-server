# ThinkProfit Server

Backend service for ThinkProfit, a SaaS platform for business insights and financial analytics.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/thinkprofit/thinkprofit-server.git
    cd thinkprofit-server
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a .env file in the root directory and add the required environment variables (see Environment Variables section).

## Usage

Start the development server:

```sh
npm run dev
```

For production:

```sh
npm run build
npm start
```

## Testing

Run unit tests:

```sh
npm run test
```

Run e2e tests:

```sh
npm run test:e2e
```

## CI/CD

Our CI/CD pipeline uses GitHub Actions with the following stages:
- Build validation
- Unit & E2E testing
- Code quality checks
- Automated deployment to staging/production

## Environment Variables

Required environment variables:
- `PORT` - Server port (default: 3000)
- `FIREBASE_TYPE` - Firebase service account type
- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_PRIVATE_KEY_ID` - Firebase private key ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key (in PEM format)
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_CLIENT_ID` - Firebase client ID
- `FIREBASE_AUTH_URI` - Firebase authentication URI
- `FIREBASE_TOKEN_URI` - Firebase token URI
- `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` - Firebase auth provider certificate URL
- `FIREBASE_CLIENT_X509_CERT_URL` - Firebase client certificate URL
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL

## License

Copyright © 2023 ThinkProfit. All rights reserved.
