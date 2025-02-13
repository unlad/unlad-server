# Requirements
Add the following files:
```fs
/secrets/session/secret
/secrets/ssl/server.crt
/secrets/ssl/server.key
.env
```

- `/secrets/ssl/server.*` files must be a valid certificate/key
- [see here for .env contents](#environment)

# Environment
```ini
# Environment
ENV = "TEST" OR "PROD"

# Web
WEB_PORT = 443 OR ANY INTEGER

# Database
DB_NAME = "data"
DB_USER = "postgres"
DB_PASSWORD = "." OR ANY PASSWORD
DB_HOST = 172.17.0.1
DB_PORT = 5432

# Authentication
MAX_AGE = 3 OR ANY INTEGER

# Argon2 Parameters
HASH_BYTES = 64 OR ANY INTEGER
HASH_TIME = 3 OR ANY INTEGER
HASH_MEMORY = 65536 OR ANY INTEGER
HASH_THREADS = 4 OR ANY INTEGER
```

# Usage

```sh
npm i

npm run build

npm run start:docker
or 
npm run dev:docker
```