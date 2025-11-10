#!/bin/bash

# Meridian Infrastructure Deployment Script
# Deploys base infrastructure (VPC, databases, queues, etc.)
# Lambda functions are deployed separately by each team

set -e

echo "🏗️  Meridian Infrastructure Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo -e "${RED}❌ SAM CLI not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Get configuration
echo "📝 Configuration"
echo "==============="
echo ""

read -p "Environment (dev/staging/prod) [dev]: " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-dev}

read -p "AWS Region [us-east-1]: " REGION
REGION=${REGION:-us-east-1}

read -p "Cognito User Pool ID (from auth team): " COGNITO_POOL_ID
if [ -z "$COGNITO_POOL_ID" ]; then
    echo -e "${RED}❌ Cognito User Pool ID is required${NC}"
    exit 1
fi

# Generate or ask for database password
echo ""
read -p "Generate random database password? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    echo -e "${YELLOW}🔐 Generated password: $DB_PASSWORD${NC}"
    echo -e "${YELLOW}⚠️  SAVE THIS PASSWORD! You'll need it for Lambda deployments.${NC}"
else
    read -sp "Enter database password (min 8 chars): " DB_PASSWORD
    echo ""
    if [ ${#DB_PASSWORD} -lt 8 ]; then
        echo -e "${RED}❌ Password must be at least 8 characters${NC}"
        exit 1
    fi
fi

# Confirm
echo ""
echo "📦 Ready to deploy:"
echo "  Stack: meridian-infrastructure-${ENVIRONMENT}"
echo "  Region: ${REGION}"
echo "  Cognito Pool: ${COGNITO_POOL_ID}"
echo ""
echo -e "${YELLOW}⏱️  This will take 10-15 minutes (RDS creation is slow)${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update samconfig
echo ""
echo "📝 Updating configuration..."
cat > samconfig.toml << EOF
version = 0.1

[default]
[default.global.parameters]
stack_name = "meridian-infrastructure-${ENVIRONMENT}"

[default.build.parameters]
cached = true
parallel = true

[default.deploy.parameters]
capabilities = "CAPABILITY_NAMED_IAM"
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
sam build --template template-infrastructure.yaml

echo -e "${GREEN}✅ Build complete${NC}"

# Deploy
echo ""
echo "🚀 Deploying infrastructure to AWS..."
echo ""

sam deploy

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Infrastructure deployment successful!${NC}"
    echo ""
    
    # Get outputs
    echo "📊 Infrastructure Outputs:"
    echo "========================="
    
    VPC_ID=$(aws cloudformation describe-stacks \
        --stack-name "meridian-infrastructure-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`VpcId`].OutputValue' \
        --output text)
    
    POSTGRES_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-infrastructure-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`PostgresEndpoint`].OutputValue' \
        --output text)
    
    REDIS_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-infrastructure-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
        --output text)
    
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "meridian-infrastructure-${ENVIRONMENT}" \
        --region "${REGION}" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
        --output text)
    
    echo "VPC ID: $VPC_ID"
    echo "API Endpoint: $API_ENDPOINT"
    echo "PostgreSQL: $POSTGRES_ENDPOINT"
    echo "Redis: $REDIS_ENDPOINT"
    echo ""
    
    # Save environment file
    echo "💾 Saving environment configuration..."
    cat > .env.${ENVIRONMENT} << EOF
# Meridian Infrastructure - ${ENVIRONMENT}
# Generated: $(date)

ENVIRONMENT=${ENVIRONMENT}
AWS_REGION=${REGION}

# Network
VPC_ID=${VPC_ID}

# API
API_ENDPOINT=${API_ENDPOINT}
COGNITO_USER_POOL_ID=${COGNITO_POOL_ID}

# Database
POSTGRES_HOST=${POSTGRES_ENDPOINT}
POSTGRES_PORT=5432
POSTGRES_DB=meridian
POSTGRES_USER=meridian_admin
POSTGRES_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_HOST=${REDIS_ENDPOINT}
REDIS_PORT=6379
EOF
    
    echo -e "${GREEN}✅ Environment saved to .env.${ENVIRONMENT}${NC}"
    echo ""
    
    # Store password in Secrets Manager
    echo "🔐 Storing database password in Secrets Manager..."
    aws secretsmanager create-secret \
        --name "meridian/db/password-${ENVIRONMENT}" \
        --secret-string "${DB_PASSWORD}" \
        --region "${REGION}" \
        2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id "meridian/db/password-${ENVIRONMENT}" \
        --secret-string "${DB_PASSWORD}" \
        --region "${REGION}" \
        2>/dev/null
    
    echo -e "${GREEN}✅ Password stored in Secrets Manager${NC}"
    echo ""
    
    # Next steps
    echo "📝 Next Steps:"
    echo "============="
    echo ""
    echo "1️⃣  Initialize database schema:"
    echo "   ${BLUE}psql -h ${POSTGRES_ENDPOINT} -U meridian_admin -d meridian${NC}"
    echo "   Then run your schema SQL"
    echo ""
    echo "2️⃣  Share these CloudFormation exports with your team:"
    echo "   ${BLUE}aws cloudformation list-exports | grep Meridian${NC}"
    echo ""
    echo "3️⃣  Teams can now deploy their Lambda functions using:"
    echo "   ${BLUE}template-service.yaml${NC}"
    echo "   See TEAM_README.md for instructions"
    echo ""
    echo "4️⃣  Deploy Dispatcher Docker container:"
    echo "   - Build: ${BLUE}cd dispatcher && docker build -t meridian-dispatcher .${NC}"
    echo "   - Push to ECR"
    echo "   - Deploy ECS task"
    echo ""
    echo "5️⃣  Monitor deployment:"
    echo "   CloudWatch: ${BLUE}https://console.aws.amazon.com/cloudwatch/home?region=${REGION}${NC}"
    echo "   X-Ray: ${BLUE}https://console.aws.amazon.com/xray/home?region=${REGION}${NC}"
    echo ""
    echo -e "${GREEN}🎉 Infrastructure ready for Lambda deployments!${NC}"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check error messages above for details"
    exit 1
fi
