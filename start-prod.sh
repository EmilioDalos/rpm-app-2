#!/bin/bash

# Zet script in veilige modus
set -e

echo "🚀 Starting RPM App development servers..."

# Database gegevens
DB_NAME="my_rpm_db"
DB_USER="my_rpm_app"
DB_PASSWORD="app"
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_CONTAINER="postgres_container"
SQL_FILE="./backend/database/create-db.sql"

# Functie om processen netjes af te sluiten
cleanup() {
    echo "🛑 Stopping all servers and containers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    docker-compose down
    echo "✅ All servers and containers stopped."
    exit 0
}

# Als het script wordt afgebroken (Ctrl+C), voer dan cleanup uit
trap cleanup SIGINT SIGTERM

# Controleer of Docker actief is
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "🐳 Docker is not running. Attempting to start Docker Desktop..."
        open -a Docker  # Start Docker Desktop op macOS
        while ! docker info >/dev/null 2>&1; do
            echo "⏳ Waiting for Docker to start..."
            sleep 3
        done
        echo "✅ Docker is now running."
    else
        echo "✅ Docker is already running."
    fi
}

# Controleer of Docker actief is en start deze indien nodig
check_docker

# Stop bestaande processen op poorten 3000 en 3001
echo "🛑 Stopping any existing processes..."
pkill -f "npm run dev" || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Controleer of docker-compose.yml bestaat
if [ -f "docker-compose_dev.yml" ]; then
  echo "🐳 Starting Docker containers..."
  docker-compose down
  docker-compose -f docker-compose.yml up -d --build
  echo "✅ Docker containers started successfully."
else
  echo "❌ No docker-compose.yml found. Skipping Docker startup."
fi

# Functie om te controleren of PostgreSQL klaar is
check_postgres() {
  echo "🔍 Checking if PostgreSQL is ready..."
  while true; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' $POSTGRES_CONTAINER)
    if [ "$STATUS" == "healthy" ]; then
      echo "✅ PostgreSQL server is ready!"
      break
    else
      echo "⏳ Waiting for PostgreSQL server to be ready... Current status: $STATUS"
      sleep 2
    fi
  done
}

# Controleer of de database en tabellen bestaan, en maak deze aan als nodig
setup_database() {
  check_postgres
  
  echo "🔍 Checking if the PostgreSQL database exists..."
  DB_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';")
  echo "DB_EXISTS: $DB_EXISTS"
  if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database '$DB_NAME' already exists."
  else
    echo "⚙️ Creating database '$DB_NAME'..."
    docker exec -it $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created successfully."
    echo "📦 Copying and executing SQL file to create tables in '$DB_NAME'..."
    docker cp $SQL_FILE $POSTGRES_CONTAINER:/create-db.sql
    docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME -f /create-db.sql
    echo "✅ Tables created successfully from $SQL_FILE."
  fi
}

# Controleer of de database en tabellen bestaan, en maak deze aan als nodig
setup_database

# Start backend server
echo "📦 Starting backend server..."
if [ -d "backend" ]; then
  cd backend
  if [ -f "package.json" ]; then
    npm install
    BACKEND_PORT=$(find_open_port 3001)
    echo "Starting backend on port $BACKEND_PORT..."
    export PORT=$BACKEND_PORT
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started with PID: $BACKEND_PID on port $BACKEND_PORT"
  else
    echo "❌ No backend package.json found! Skipping backend startup."
  fi
  cd ..
fi

# Start frontend server
echo "📦 Starting frontend server..."
if [ -d "frontend" ]; then
  cd frontend
  if [ -f "package.json" ]; then
    npm install
    FRONTEND_PORT=$(find_open_port 3000)
    echo "Starting frontend on port $FRONTEND_PORT..."
    export PORT=$FRONTEND_PORT
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started with PID: $FRONTEND_PID on port $FRONTEND_PORT"
  else
    echo "❌ No frontend package.json found! Skipping frontend startup."
  fi
  cd ..
fi

# Wacht totdat een van de servers eindigt
wait $BACKEND_PID $FRONTEND_PID

# Cleanup als de servers eindigen
cleanup