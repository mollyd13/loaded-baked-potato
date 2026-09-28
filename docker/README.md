## Usage

### Start Backend + Database:
```bash
docker-compose up
```
This starts both the Spring Boot backend (port 8081) and PostgreSQL database (port 5432).

To run in background:
```bash
docker-compose up -d
```

### Stop All Services:
```bash
docker-compose down
```

### View Logs:
View all logs (backend + database):
```bash
docker-compose logs -f
```

View only backend logs:
```bash
docker-compose logs -f app
```

View only database logs:
```bash
docker-compose logs -f primary
```

### Access the Database:
```bash
docker exec -it primary-db psql -U postgres -d primary
```

### Access the Tables:
```bash
docker exec -it primary-db psql -U postgres -d primary -c "\dt app.*"
```

### Rebuild with Fresh Data:
```bash
docker-compose down -v
docker-compose up --build
```

### Access the APIs:
- Backend API: `http://localhost:8081`
- Health check: `curl http://localhost:8081/health`
