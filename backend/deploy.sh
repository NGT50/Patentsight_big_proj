#!/bin/bash
set -e

JAR_PATH="$1"
if [ -z "$JAR_PATH" ]; then
  echo "Usage: $0 <jar-path>"
  exit 1
fi

# Directory where this script resides (e.g., /home/ubuntu/app)
APP_HOME="$(dirname "$(readlink -f "$0")")"
JAR_NAME="$(basename "$JAR_PATH")"

echo "Deploying $JAR_NAME"

PID=$(pgrep -f "$JAR_NAME" || true)
if [ -n "$PID" ]; then
  echo "Stopping existing process $PID"
  kill "$PID"
  sleep 2
fi

CONFIG_FILE="$APP_HOME/application.yml"
if [ -f "$CONFIG_FILE" ]; then
  CONFIG_ARG="--spring.config.location=$CONFIG_FILE"
else
  CONFIG_ARG=""
fi

CMD=(java -jar "$JAR_PATH")
if [ -n "$CONFIG_ARG" ]; then
  CMD+=("$CONFIG_ARG")
fi

nohup "${CMD[@]}" > "$APP_HOME/app.log" 2>&1 &

echo "Started $JAR_NAME (logging to $APP_HOME/app.log)"

