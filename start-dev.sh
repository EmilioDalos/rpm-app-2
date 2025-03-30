#!/bin/bash

# Enable strict mode
set -e

POSTGRES_CONTAINER="postgres_container"
DB_USER="my_rpm_app"
DB_NAME="my_rpm_db"

echo "🚀 Starting RPM App development servers..."

check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "🐳 Docker is not running. Attempting to start Docker Desktop..."
    open -a Docker
    while ! docker info >/dev/null 2>&1; do
      echo "⏳ Waiting for Docker to start..."
      sleep 3
    done
    echo "✅ Docker is now running."
  else
    echo "✅ Docker is already running."
  fi
}

disconnect_users() {
  echo "📌 Disconnecting users from $DB_NAME..."
  docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c \
    "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true
}

check_postgres() {
  RUNNING=$(docker inspect -f '{{.State.Running}}' $POSTGRES_CONTAINER 2>/dev/null || echo "false")
  if [ "$RUNNING" == "true" ]; then
    echo "✅ PostgreSQL is already running. Skipping Docker startup."
  else
    echo "🐳 Starting PostgreSQL Docker container..."
    docker-compose up -d postgres
    echo "✅ PostgreSQL Docker container started successfully."
  fi
}

initialize_database() {
  echo "📦 Creating tables from create-db.sql..."
  docker cp ./backend/database/create-db.sql $POSTGRES_CONTAINER:/create-db.sql
  docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME -f /create-db.sql
  echo "✅ Tables created."

  echo "📦 Inserting test data..."
  docker cp ./backend/database/insert-testdata.sql $POSTGRES_CONTAINER:/insert-testdata.sql
  docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME -f /insert-testdata.sql
  echo "✅ Test data inserted."
}

setup_database() {
  check_postgres
  echo "🔍 Checking if database '$DB_NAME' exists..."
  DB_EXISTS=$(docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -tAc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | tr -d '[:space:]')

  if [ "$DB_EXISTS" == "1" ]; then
    echo "✅ Database '$DB_NAME' already exists."
    echo -n "❓ Do you want to recreate the database? (yes/no) > "
    read -t 4 RECREATE || RECREATE="no"
    if [[ "$RECREATE" == "yes" ]]; then
      disconnect_users
      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE $DB_NAME;"
      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
      echo "✅ Database recreated."
      initialize_database
    else
      echo "⏩ No input or not 'yes'. Continuing with existing database."
    fi
  else
    echo -n "⚙️ Database '$DB_NAME' does not exist. Create now? (yes/no) > "
    read -t 4 CREATE || CREATE="no"
    if [[ "$CREATE" == "yes" ]]; then
      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
      echo "✅ Database created."
      initialize_database
    else
      echo "⏩ No input or not 'yes'. Skipping database creation."
    fi
  fi
}

# Start-up sequence
check_docker
check_postgres
setup_database

echo "🛑 Killing dev processes on 3000 and 3001..."
pkill -f "npm run dev" || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

echo "📦 Starting backend..."
if [ -d "backend" ]; then
  cd backend
  [ -f "package.json" ] && npm install && npm run dev & BACKEND_PID=$!
  cd ..
fi

echo "📦 Starting frontend..."
if [ -d "frontend" ]; then
  cd frontend
  [ -f "package.json" ] && npm install && npm run dev & FRONTEND_PID=$!
  cd ..
fi

wait $BACKEND_PID $FRONTEND_PID