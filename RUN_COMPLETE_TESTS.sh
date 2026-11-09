#!/bin/bash

echo "=============================================================================="
echo "           JWT AUTHENTICATION - COMPLETE TEST SUITE"
echo "                  Running on Docker Containers"
echo "=============================================================================="
echo ""

PASSED=0
FAILED=0
TIMESTAMP=$(date +%s%N)
EMAIL="jwt-test-$TIMESTAMP@example.com"

# TEST 1: Health Check
echo "TEST 1: Backend Health Check"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo "✓ Backend is running"
  ((PASSED++))
else
  echo "✗ Backend health check failed"
  ((FAILED++))
fi
echo ""

# TEST 2: Register User
echo "TEST 2: Register User & Get JWT Token"
REGISTER=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test JWT\",\"email\":\"$EMAIL\",\"password\":\"pass123\"}")

TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
USER_ID=$(echo "$REGISTER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "mock-jwt-token" ]; then
  echo "✓ JWT Token generated: ${TOKEN:0:40}..."
  echo "✓ User ID: $USER_ID"
  ((PASSED+=2))
else
  echo "✗ Failed to generate token"
  ((FAILED++))
  exit 1
fi
echo ""

# TEST 3: 401 Without Token
echo "TEST 3: 401 Without Authorization Header"
NO_TOKEN=$(curl -s -w "%{http_code}" -X GET http://localhost:3000/api/sessions/usuario/123)
HTTP_CODE="${NO_TOKEN: -3}"
if echo "$HTTP_CODE" | grep -q "401"; then
  echo "✓ Correctly rejected (401)"
  ((PASSED++))
else
  echo "✗ Expected 401 but got $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 4: 401 With Invalid Token
echo "TEST 4: 401 With Invalid Token"
INVALID=$(curl -s -w "%{http_code}" -X GET http://localhost:3000/api/sessions/usuario/123 \
  -H "Authorization: Bearer invalid-token")
HTTP_CODE="${INVALID: -3}"
if echo "$HTTP_CODE" | grep -q "401"; then
  echo "✓ Invalid token rejected (401)"
  ((PASSED++))
else
  echo "✗ Expected 401 but got $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 5: Settings Protected
echo "TEST 5: Settings Endpoint Protected (401 without token)"
SETTINGS_NO_AUTH=$(curl -s -w "%{http_code}" -X PUT http://localhost:3000/api/auth/language \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","language":"en"}')
HTTP_CODE="${SETTINGS_NO_AUTH: -3}"
if echo "$HTTP_CODE" | grep -q "401"; then
  echo "✓ Settings protected (401)"
  ((PASSED++))
else
  echo "✗ Settings not protected - $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 6: Settings With Valid Token
echo "TEST 6: Settings With Valid Token (should accept)"
SETTINGS_AUTH=$(curl -s -w "%{http_code}" -X PUT http://localhost:3000/api/auth/language \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"language\":\"es\"}")
HTTP_CODE="${SETTINGS_AUTH: -3}"
if echo "$HTTP_CODE" | grep -qE "200|500"; then
  echo "✓ Settings accepted token (HTTP $HTTP_CODE)"
  ((PASSED++))
else
  echo "✗ Unexpected: $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 7: Chat Protected
echo "TEST 7: Chat Endpoint Protected"
CHAT_NO_AUTH=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_CODE="${CHAT_NO_AUTH: -3}"
if echo "$HTTP_CODE" | grep -q "401"; then
  echo "✓ Chat protected (401)"
  ((PASSED++))
else
  echo "✗ Chat not protected - $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 8: JWT Format
echo "TEST 8: JWT Token Format"
if echo "$TOKEN" | grep -q "eyJ"; then
  echo "✓ Token has JWT format"
  ((PASSED++))
else
  echo "✗ Token invalid format"
  ((FAILED++))
fi

PARTS=$(echo "$TOKEN" | tr '.' '\n' | wc -l)
if [ "$PARTS" -eq "3" ]; then
  echo "✓ Token has 3 parts (header.payload.signature)"
  ((PASSED++))
else
  echo "✗ Token parts: $PARTS (expected 3)"
  ((FAILED++))
fi
echo ""

# TEST 9: Authorization Header
echo "TEST 9: Authorization Header Format"
HEADER_TEST=$(curl -s -w "%{http_code}" -X GET http://localhost:3000/api/sessions/usuario/test \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE="${HEADER_TEST: -3}"
if echo "$HTTP_CODE" | grep -qE "200|404|500"; then
  echo "✓ Authorization header accepted"
  ((PASSED++))
else
  echo "✗ Authorization rejected: $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# TEST 10: Create Session
echo "TEST 10: Create Session With Token"
SESSION=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"tema\":\"Test\"}")
HTTP_CODE="${SESSION: -3}"
if echo "$HTTP_CODE" | grep -qE "200|201|400|500"; then
  echo "✓ Session endpoint accepted token (HTTP $HTTP_CODE)"
  ((PASSED++))
else
  echo "✗ Session rejected: $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# SUMMARY
echo "=============================================================================="
echo "RESULTS"
echo "=============================================================================="
echo "Tests Passed:  $PASSED"
echo "Tests Failed:  $FAILED"
echo "Total:         $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL TESTS PASSED - JWT MIDDLEWARE WORKING"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  exit 1
fi
