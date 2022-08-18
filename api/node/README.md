# NewsHub Node.js API

## Prerequisites

-   [Node.js](https://nodejs.org/en/)
-   [NestJS](https://nestjs.com/)
-   [TypeScript](https://www.typescriptlang.org/)

1. Create dotenv file with the following content:

```
NODE_ENV="development" # default to development
APP_PORT=3000
VERSION=v0.0.0

DATABASE_HOST="" # default to 'localhost'
DATABASE_PORT=3306 # default to 3306
DATABASE_USERNAME=""
DATABASE_PASSWORD=""
DATABASE_NAME=""

TWITTER_BEARER_TOKEN=""
PYTHON_API_URL=""
JWT_SECRET=""
JWT_EXPIRES_IN="1d" # default to 1 hour
```

2. Replace all empty strings with the correct values.

## Installation (Docker)

1. Done. Go [back](/README.md) to the root of the project and follow the instructions.

## Installation (local)

1. Install the dependencies.

```bash
$ yarn install
```

2. Run the server.

```bash
$ yarn start:dev
```
