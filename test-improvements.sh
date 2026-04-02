#!/bin/bash
# Testing script for API improvements
# Run from project root: bash test-api.sh

echo "==== EE Predictor API Improvements Test Suite ===="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL="https://ee-predictor-backend.onrender.com"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}Test 1: Backend Health Check${NC}"
echo "Checking if backend is responsive..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" -m 5)
if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    echo -e "${GREEN}✓ Backend is reachable (HTTP $response)${NC}"
else
    echo -e "${RED}✗ Backend returned HTTP $response${NC}"
    echo "  This might mean:"
    echo "  - Backend is sleeping (Render free tier)"
    echo "  - Network connection issue"
    echo "  - Backend is down"
fi
echo ""

echo -e "${BLUE}Test 2: CORS Configuration${NC}"
echo "Checking CORS headers..."
cors=$(curl -s -I "$BACKEND_URL/analytics" | grep -i "access-control-allow-origin" || echo "NOT FOUND")
if [ "$cors" != "NOT FOUND" ]; then
    echo -e "${GREEN}✓ CORS headers present:${NC}"
    echo "  $cors"
else
    echo -e "${YELLOW}⚠ CORS headers not found${NC}"
    echo "  This might be OK if endpoint requires auth"
fi
curl_headers=$(curl -s -I "$BACKEND_URL/analytics" | head -20)
echo ""

echo -e "${BLUE}Test 3: Authentication Endpoints${NC}"
echo "Testing /auth/login endpoint..."
test_response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@slsu.edu.ph","password":"test"}' \
  -m 10)

if echo "$test_response" | grep -q "detail\|access_token\|password"; then
    echo -e "${GREEN}✓ Auth endpoint responsive${NC}"
    echo "  Response preview: $(echo "$test_response" | cut -c1-100)..."
else
    echo -e "${RED}✗ Auth endpoint not responding properly${NC}"
fi
echo ""

echo -e "${BLUE}Test 4: Analytics Endpoint${NC}"
echo "Testing /analytics endpoint..."
analytics=$(curl -s -X GET "$BACKEND_URL/analytics" -m 10)
if echo "$analytics" | grep -q "total\|analysis\|error"; then
    echo -e "${GREEN}✓ Analytics endpoint responsive${NC}"
    echo "  Response preview: $(echo "$analytics" | cut -c1-100)..."
else
    echo -e "${RED}✗ Analytics endpoint not responding properly${NC}"
fi
echo ""

echo -e "${BLUE}Test 5: Response Time Measurement${NC}"
echo "Measuring API response times..."
response_time=$(curl -s -w "%{time_total}" -o /dev/null "$BACKEND_URL/health" -m 10)
echo "Health check time: ${response_time}s"
if (( $(echo "$response_time < 1" | bc -l) )); then
    echo -e "${GREEN}✓ Fast response${NC}"
elif (( $(echo "$response_time < 5" | bc -l) )); then
    echo -e "${YELLOW}⚠ Moderate response time (cold start?)${NC}"
else
    echo -e "${RED}✗ Slow response time${NC}"
    echo "  Consider upgrading Render tier"
fi
echo ""

echo -e "${BLUE}Test 6: Frontend Setup Check${NC}"
echo "Checking if frontend files exist..."
if [ -f "frontend/src/api-service.js" ]; then
    echo -e "${GREEN}✓ api-service.js found${NC}"
else
    echo -e "${RED}✗ api-service.js NOT found${NC}"
    echo "  Run: npm install --force"
fi

if [ -f "frontend/src/useApiCall.js" ]; then
    echo -e "${GREEN}✓ useApiCall.js found${NC}"
else
    echo -e "${RED}✗ useApiCall.js NOT found${NC}"
fi

if grep -q "api-service" "frontend/src/App.jsx"; then
    echo -e "${GREEN}✓ App.jsx updated with api-service${NC}"
else
    echo -e "${RED}✗ App.jsx NOT using api-service${NC}"
fi
echo ""

echo -e "${BLUE}Test 7: Environment Variables${NC}"
if grep -q "API_BASE_URL" "frontend/src/apiBase.js"; then
    api_url=$(grep "API_BASE_URL" "frontend/src/apiBase.js" | grep -oE '"[^"]*"' | sed 's/"//g')
    echo -e "${GREEN}✓ API Base URL configured:${NC}"
    echo "  $api_url"
else
    echo -e "${RED}✗ apiBase.js not configured${NC}"
fi
echo ""

echo -e "${BLUE}Test 8: Database Connection${NC}"
echo "Testing database connectivity (requires auth)..."
echo "⚠  Cannot test without valid auth token"
echo "  The app will attempt to connect when you login"
echo ""

echo -e "${YELLOW}==== Test Summary ==== ${NC}"
echo ""
echo "If all tests pass:"
echo "  1. Start frontend: cd frontend && npm start"
echo "  2. Try logging in as student/professor"
echo "  3. Refresh page (should stay logged in)"
echo "  4. Check DevTools Console for retry logs"
echo ""
echo "If backend test failed:"
echo "  1. Backend might be sleeping (Render free tier)"
echo "  2. Wait 30-60 seconds and try again"
echo "  3. Check Render dashboard for errors"
echo "  4. Verify DATABASE_URL is set in Render env vars"
echo ""
echo "If frontend tests failed:"
echo "  1. Run: npm install"
echo "  2. Verify files are in correct locations"
echo "  3. Check git status for uncommitted changes"
echo ""
