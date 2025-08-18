#!/bin/bash
JAR_PATH="$1"
if [ -z "$JAR_PATH" ]; then
  echo "Usage: $0 <jar-path>"
  exit 1
fi

APP_DIR=$(dirname "$JAR_PATH")
JAR_NAME=$(basename "$JAR_PATH")

echo "Deploying $JAR_NAME"

PID=$(pgrep -f "$JAR_NAME" || true)
if [ -n "$PID" ]; then
  echo "Stopping existing process $PID"
  kill "$PID"
  sleep 2
fi

nohup java -jar "$JAR_PATH" > "$APP_DIR/app.log" 2>&1 &

echo "Started $JAR_NAME"

