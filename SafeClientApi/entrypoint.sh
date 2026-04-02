#!/bin/sh
set -e

echo "▶ Executando seed..."
node dist/database/seed.js

echo "▶ Iniciando API..."
exec node dist/main.js
