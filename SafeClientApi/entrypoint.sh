#!/bin/sh
set -e

echo "▶ Iniciando API (TypeORM sync das tabelas)..."
node dist/main.js &
API_PID=$!

echo "⏳ Aguardando API ficar pronta..."
RETRIES=30
until wget -q -O /dev/null "http://localhost:3000/auth/login" 2>/dev/null || [ $RETRIES -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ API não respondeu a tempo."
  kill $API_PID 2>/dev/null
  exit 1
fi

echo "✅ API pronta. Executando seed..."
node dist/database/seed.js || echo "⚠️  Seed finalizado com avisos (dados já existem?)"

echo "▶ API em execução (PID $API_PID)..."
wait $API_PID
