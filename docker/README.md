## Usage

### Start PostgreSQL:
```bash
docker-compose up -d primary
```

### Stop PostgreSQL:
```bash
docker-compose down
```

### Access the database:
```bash
docker exec -it primary-db psql -U postgres -d primary
```

### View logs:
```bash
docker-compose logs -f primary
```

### Rebuild with fresh data:
```bash
docker-compose down -v
docker-compose up -d primary
```
