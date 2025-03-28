#!/bin/bash

# Enable strict mode
set -e

POSTGRES_CONTAINER="postgres_container"
DB_USER="my_rpm_app"
DB_NAME="my_rpm_db"

echo "🚀 Starting RPM App development servers..."

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "🐳 Docker is not running. Attempting to start Docker Desktop..."
        open -a Docker  # macOS only
        while ! docker info >/dev/null 2>&1; do
            echo "⏳ Waiting for Docker to start..."
            sleep 3
        done
        echo "✅ Docker is now running."
    else
        echo "✅ Docker is already running."
    fi
}

# Function to terminate active connections to the database
disconnect_users() {
    echo "📌 Disconnecting all active connections to '$DB_NAME'..."
    docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true
    echo "✅ All active connections to the database have been terminated."
}

# Function to check if the PostgreSQL container is running
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

# Function to set up the database and tables
setup_database() {
  check_postgres
  
  echo "🔍 Checking if the PostgreSQL database exists..."
  DB_EXISTS=$(docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" | tr -d '[:space:]')
  
  if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database '$DB_NAME' already exists."
    echo -n "❓ Do you want to recreate the database? (yes/no) (Continue in 4 seconds if no answer): "
    
    read -t 4 RECREATE_DB || RECREATE_DB="no"

    if [ "$RECREATE_DB" = "yes" ]; then
      echo "⚙️ Recreating database '$DB_NAME'..."
      
      # Disconnect active connections before dropping the database
      disconnect_users
      
      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
      echo "🗑️  Old database dropped."

      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
      echo "✅ Database '$DB_NAME' recreated."

      initialize_database
    else
      echo "✅ Keeping existing database."
    fi
  else
    echo "⚙️ Creating new database '$DB_NAME'..."
    docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created."
    
    initialize_database
  fi
}

# Function to initialize the database with tables and test data
initialize_database() {
  echo "📦 Creating tables from create-db.sql..."
  docker cp ./backend/database/create-db.sql $POSTGRES_CONTAINER:/create-db.sql
  docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME -f /create-db.sql
  echo "✅ Tables successfully created from create-db.sql."

  echo "📦 Inserting test data..."
  docker cp ./backend/database/insert-testdata.sql $POSTGRES_CONTAINER:/insert-testdata.sql
  docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME -f /insert-testdata.sql
  echo "✅ Test data successfully inserted from insert-testdata.sql."
}

# Check if Docker is running
check_docker

# Check if PostgreSQL container is running
check_postgres

# Check if the database exists or needs to be created
setup_database  

# Stop any existing processes on ports 3000 and 3001
echo "🛑 Stopping any existing processes..."
pkill -f "npm run dev" || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "📦 Starting backend server..."
if [ -d "backend" ]; then
  cd backend
  if [ -f "package.json" ]; then
    npm install
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started with PID: $BACKEND_PID"
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
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started with PID: $FRONTEND_PID"
  else
    echo "❌ No frontend package.json found! Skipping frontend startup."
  fi
  cd ..
fi

# Wait for either the frontend or backend server to exit
wait $BACKEND_PID $FRONTEND_PID