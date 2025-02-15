# Secrets

## SSL
- `/secrets/ssl/server.key` - X.509 certificate private key
- `/secrets/ssl/server.crt` - X.509 security certificate

## Session
- `/secrets/session/secret` - Cookie signature cipher secret



# Environment
```ini
# Environment
ENV = "TEST" OR "PROD"

# Web
WEB_PORT = 443 OR ANY INTEGER
WEB_IPS = "127.0.0.1; 0.0.0.0" OR ANY COMMA SEPARATED IP LIST
WEB_URIS = "localhost" OR ANY COMMA SEPARATED URI LIST

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