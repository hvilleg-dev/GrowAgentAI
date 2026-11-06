#!/bin/bash

echo "🧪 Testing GrowAgentAI Backend"
echo "================================"

# Test 1: Health Check
echo ""
echo "1️⃣  Testing GET /health"
curl -s http://localhost:3000/health | head -1
echo ""

# Test 2: API Info
echo "2️⃣  Testing GET /api"
curl -s http://localhost:3000/api | head -5
echo ""

# Test 3: Create Session
echo "3️⃣  Testing POST /api/sessions (create session)"
USUARIO_ID="550e8400-e29b-41d4-a716-446655440001"
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d "{\"usuarioId\": \"$USUARIO_ID\", \"objetivo\": \"Mejorar mi comunicación\"}")
echo "$SESSION_RESPONSE"
SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"
echo ""

# Test 4: Get Session
if [ ! -z "$SESSION_ID" ]; then
  echo "4️⃣  Testing GET /api/sessions/:sesionId"
  curl -s http://localhost:3001/api/sessions/$SESSION_ID | head -3
  echo ""
fi

echo "✅ Tests completed"
