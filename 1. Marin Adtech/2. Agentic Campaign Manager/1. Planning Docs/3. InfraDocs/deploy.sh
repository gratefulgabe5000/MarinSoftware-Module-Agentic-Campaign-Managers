#!/bin/bash

# Meridian Quick Deploy Script
# This script helps you deploy the Meridian architecture with minimal fuss

set -e

echo "🚀 Meridian Deployment Helper"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    echo "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo -e "${RED}❌ SAM CLI not found${NC}"
    echo "Install: brew install aws-sam-cli"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    echo "Install: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Get deployment parameters
echo "📝 Configuration"
echo "==============="
echo ""

read -p "Environment (dev/staging/prod) [dev]: " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-dev}

read -p "AWS Region [us-east-1]: " REGION
REGION=${REGION:-us-east-1}

read -p "Cognito User Pool ID (from teammate): " COGNITO_POOL_ID
if [ -z "$COGNITO_POOL_ID" ]; then
    echo -e "${RED}❌ Cognito User Pool ID is required${NC}"
    exit 1
fi

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo -e "${YELLOW}🔐 Generated database password (save this!): $DB_PASSWORD${NC}"

# Confirm
echo ""
echo "📦 Ready to deploy with:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  Cognito Pool: $COGNITO_POOL_ID"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update samconfig.toml
echo ""
echo "📝 Updating configuration..."
cat > samconfig.toml << EOF
version = 0.1

[default]
[default.global.parameters]
stack_name = "meridian-${ENVIRONMENT}"

[default.build.parameters]
cached = true
parallel = true

[default.deploy.parameters]
capabilities = "CAPABILITY_IAM CAPABILITY_AUTO_EXPAND"
confirm_changeset = false
resolve_s3 = true
region = "${REGION}"
parameter_overrides = [
  "Environment=${ENVIRONMENT}",
  "CognitoUserPoolId=${COGNITO_POOL_ID}",
  "DatabaseUsername=meridian_admin",
  "DatabasePassword=${DB_PASSWORD}"
]
EOF

echo -e "${GREEN}✅ Configuration updated${NC}"

# Build
echo ""
echo "🔨 Building SAM application..."
sam build

echo -e "${GREEN}✅ Build complete${NC}"

# Deploy
echo ""
echo "🚀 Deploying to AWS..."
echo "This will take 10-15 minutes (RDS creation is slow)..."
echo ""

sam deploy

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    
    # Get outputs
    echo "📊 Deployment Outputs:"
    echo "===================="
    
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
        --output text)
    
    POSTGRES_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`PostgresEndpoint`].OutputValue' \
        --output text)
    
    REDIS_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
        --output text)
    
    echo "API Endpoint: $API_ENDPOINT"
    echo "PostgreSQL Endpoint: $POSTGRES_ENDPOINT"
    echo "Redis Endpoint: $REDIS_ENDPOINT"
    echo ""
    
    # Save credentials
    echo "💾 Saving credentials..."
    cat > .env.${ENVIRONMENT} << EOF
# Meridian ${ENVIRONMENT} Environment Variables
# Generated: $(date)

ENVIRONMENT=${ENVIRONMENT}
AWS_REGION=${REGION}

# API
API_ENDPOINT=${API_ENDPOINT}

# Database
POSTGRES_HOST=${POSTGRES_ENDPOINT}
POSTGRES_DB=meridian
POSTGRES_USER=meridian_admin
POSTGRES_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_HOST=${REDIS_ENDPOINT}
REDIS_PORT=6379

# Cognito
COGNITO_USER_POOL_ID=${COGNITO_POOL_ID}
EOF
    
    echo -e "${GREEN}✅ Credentials saved to .env.${ENVIRONMENT}${NC}"
    echo ""
    
    # Next steps
    echo "📝 Next Steps:"
    echo "============="
    echo "1. Initialize database schema:"
    echo "   psql -h ${POSTGRES_ENDPOINT} -U meridian_admin -d meridian -f schema.sql"
    echo ""
    echo "2. Build and push Dispatcher Docker image:"
    echo "   cd dispatcher && ./build-and-push.sh"
    echo ""
    echo "3. Test API with Cognito token:"
    echo "   curl -H 'Authorization: Bearer \$TOKEN' ${API_ENDPOINT}/api/campaigns"
    echo ""
    echo "4. View logs:"
    echo "   sam logs -n MainApiFunction --stack-name meridian-${ENVIRONMENT} --tail"
    echo ""
    echo "5. Monitor in CloudWatch:"
    echo "   https://console.aws.amazon.com/cloudwatch/home?region=${REGION}"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above for details"
    exit 1
fi
