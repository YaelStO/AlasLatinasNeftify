#!/bin/bash

echo "🧪 Testing Vercel Serverless Functions Locally"
echo "=================================================="

BASE_URL="http://localhost:3000"

echo ""
echo "📍 Test 1: GET /api/destinations"
curl -s "$BASE_URL/api/destinations" | jq '.' || echo "Failed"

echo ""
echo "📍 Test 2: GET /api/destinations?search=Peru"
curl -s "$BASE_URL/api/destinations?search=Peru" | jq '.' || echo "Failed"

echo ""
echo "📍 Test 3: POST /api/destinations (requires auth)"
curl -s -X POST "$BASE_URL/api/destinations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake_token" \
  -d '{
    "name": "Test Destination",
    "location": "Test Location",
    "address": "Test Address",
    "description": "Test Description"
  }' | jq '.' || echo "Failed"

echo ""
echo "📍 Test 4: POST /api/auth/register"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.' || echo "Failed"

echo ""
echo "📍 Test 5: POST /api/auth/login"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }' | jq '.' || echo "Failed"

echo ""
echo "✅ Testing complete!"
