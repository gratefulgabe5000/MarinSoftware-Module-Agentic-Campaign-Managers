# Meridian Infrastructure - Complete Package

## 📦 You Have Two Deployment Options

### Option A: All-In-One (Original)
Deploy everything at once - all infrastructure + all Lambdas together.

**Use this if:**
- You have all Lambda code ready
- Deploying to personal/test account
- Want simplest deployment

**Files:**
- `template.yaml` - Complete infrastructure + all Lambdas
- `samconfig.toml` - Configuration
- `deploy.sh` - Deployment script
- `QUICK_START.md` - Instructions

### Option B: Split Deployment (Recommended for Teams)
Infrastructure first, then each team deploys their Lambda independently.

**Use this if:**
- Teams working on different services
- Want independent deployments
- Need parallel development

**Files:**
- `template-infrastructure.yaml` - Base infrastructure only
- `template-service.yaml` - Template for each Lambda team
- `samconfig-infrastructure.toml` - Configuration
- `deploy-infrastructure.sh` - Deployment script
- `TEAM_README.md` - Instructions for teams
- `README-SPLIT-DEPLOYMENT.md` - Overview

---

## 📁 Complete File Index

### 🏗️ Infrastructure Templates

| File | Option | Description | Who Uses |
|------|--------|-------------|----------|
| **template.yaml** | A | All-in-one template (infrastructure + Lambdas) | Solo developer |
| **template-infrastructure.yaml** | B | Base infrastructure only (VPC, DB, queues) | Platform team (Jason) |
| **template-service.yaml** | B | Template for individual Lambda services | Service teams |

### ⚙️ Configuration Files

| File | Option | Description |
|------|--------|-------------|
| **samconfig.toml** | A | Config for all-in-one deployment |
| **samconfig-infrastructure.toml** | B | Config for infrastructure deployment |

### 🚀 Deployment Scripts

| File | Option | Description |
|------|--------|-------------|
| **deploy.sh** | A | Deploy everything at once |
| **deploy-infrastructure.sh** | B | Deploy infrastructure only |

### 📚 Documentation

| File | Audience | Purpose |
|------|----------|---------|
| **QUICK_START.md** | Everyone | Quick overview and 5-min deploy guide |
| **README.md** | Everyone | Architecture overview, costs, monitoring |
| **README-SPLIT-DEPLOYMENT.md** | Teams | Overview of split deployment strategy |
| **TEAM_README.md** | Service teams | How to deploy your Lambda service |
| **DEPLOYMENT_GUIDE.md** | Platform team | Detailed deployment steps |
| **LAMBDA_CODE_GUIDE.md** | Developers | Lambda code examples and patterns |

### 📊 Diagrams & Workflows

| File | Description |
|------|-------------|
| **meridian-architecture.mermaid** | Visual architecture diagram |
| **statemachines/video-generation.asl.json** | Step Functions workflow definition |

---

## 🎯 Quick Decision Guide

### "I'm deploying alone" → Use Option A

```bash
./deploy.sh
```

That's it! Everything deploys.

### "We have multiple teams" → Use Option B

**Jason (once):**
```bash
./deploy-infrastructure.sh
```

**Each team (parallel):**
```bash
# Copy template
cp template-service.yaml my-service/template.yaml
cd my-service

# Write code
vi index.js
vi package.json

# Deploy
sam build
sam deploy --parameter-overrides ServiceName=my-service
```

---

## 📖 Reading Order

### If Using Option A (All-in-One)

1. **QUICK_START.md** - Start here
2. **deploy.sh** - Run this
3. **LAMBDA_CODE_GUIDE.md** - Write your Lambda code
4. **README.md** - Architecture reference

### If Using Option B (Split Deployment)

**For Jason (Platform Team):**
1. **README-SPLIT-DEPLOYMENT.md** - Overview
2. **deploy-infrastructure.sh** - Run this
3. **TEAM_README.md** - Share with teams
4. **README.md** - Architecture reference

**For Service Teams:**
1. **TEAM_README.md** - Start here (everything you need)
2. **template-service.yaml** - Copy this
3. **LAMBDA_CODE_GUIDE.md** - Code examples

---

## 🔧 What's In Each Template

### template.yaml (Option A)
✅ VPC, subnets, NAT Gateway  
✅ PostgreSQL, Redis, DynamoDB  
✅ SQS queues (4)  
✅ S3 buckets (2)  
✅ API Gateway  
✅ 11 Lambda functions  
✅ ECS Fargate (Dispatcher)  
✅ Step Functions (video)  
✅ Kinesis, Glue, monitoring  

**Resources:** ~60  
**Outputs:** ~30  
**Size:** 32KB

### template-infrastructure.yaml (Option B)
✅ VPC, subnets, NAT Gateway  
✅ PostgreSQL, Redis, DynamoDB  
✅ SQS queues (4)  
✅ S3 buckets (2)  
✅ API Gateway  
✅ ECS Fargate (Dispatcher)  
✅ Kinesis, Glue, monitoring  
❌ Lambda functions (teams deploy these)

**Resources:** ~50  
**Outputs:** ~30 (exported for teams)  
**Size:** 25KB

### template-service.yaml (Option B)
✅ 1 Lambda function  
✅ Imports from infrastructure  
✅ VPC configuration  
✅ IAM permissions  
✅ CloudWatch logs  

**Resources:** 2  
**Size:** 5KB

---

## 💡 Common Workflows

### Scenario 1: First-Time Deployment (Option A)

```bash
# 1. Get Cognito Pool ID from auth team
export COGNITO_POOL_ID="us-east-1_ABC123"

# 2. Update samconfig.toml with Pool ID

# 3. Deploy
./deploy.sh

# 4. Initialize database
psql -h $POSTGRES_HOST -U meridian_admin -d meridian

# 5. Write Lambda code in src/*/

# 6. Redeploy
sam build && sam deploy
```

### Scenario 2: First-Time Deployment (Option B)

```bash
# Jason:
./deploy-infrastructure.sh
# Wait 15 minutes

# Each team:
cd my-service/
cp ../template-service.yaml template.yaml
# Write code
sam build && sam deploy --parameter-overrides ServiceName=my-service
```

### Scenario 3: Update Lambda Code (Option A)

```bash
# Edit code in src/your-lambda/
cd src/your-lambda/
vi index.js

# Redeploy just that Lambda
cd ../..
sam build
sam deploy
```

### Scenario 4: Update Lambda Code (Option B)

```bash
# Edit your Lambda code
vi index.js

# Redeploy just your service
sam build
sam deploy

# Done! No impact on other teams
```

### Scenario 5: Update Infrastructure

```bash
# Option A: Edit template.yaml
vi template.yaml
sam build && sam deploy

# Option B: Edit template-infrastructure.yaml
vi template-infrastructure.yaml
sam build --template template-infrastructure.yaml
sam deploy
# Teams' Lambdas continue running (no redeployment needed)
```

---

## 🚨 Important Notes

### Database Password
**Both options:** Password is stored in AWS Secrets Manager

**Option A:** Set in samconfig.toml, then:
```bash
aws secretsmanager create-secret \
  --name meridian/db/password-dev \
  --secret-string "YOUR_PASSWORD"
```

**Option B:** `deploy-infrastructure.sh` does this automatically

### Cost Breakdown

**Base Infrastructure (~$86/month):**
- Same for both options

**Lambda Costs:**
- **Option A:** All 11 Lambdas deployed (most inactive = ~$5/month)
- **Option B:** Only deployed Lambdas cost money (pay as teams deploy)

### NAT Gateway ($32/month)
To save money in dev:

```yaml
# Comment out in template:
# NatGatewayEIP:
#   Type: AWS::EC2::EIP
# NatGateway:
#   Type: AWS::EC2::NatGateway
# PrivateRoute:
#   Type: AWS::EC2::Route
```

**Tradeoff:** Lambdas won't have internet access (can't call external APIs)

---

## 📞 Getting Help

### Questions About...

**Which option to use?**
→ See "Quick Decision Guide" above

**How to deploy?**
→ Option A: QUICK_START.md  
→ Option B: README-SPLIT-DEPLOYMENT.md

**How to write Lambda code?**
→ LAMBDA_CODE_GUIDE.md

**Architecture details?**
→ README.md

**Team coordination?**
→ TEAM_README.md

**Troubleshooting?**
→ DEPLOYMENT_GUIDE.md (detailed)

### Common Issues

**"Template too large"**
→ Use Option B (split deployment)

**"Team can't deploy independently"**
→ Use Option B with template-service.yaml

**"Need to update just one Lambda"**
→ Option B is better for this

**"Deployment takes too long"**
→ RDS creation always takes 10-15 min (both options)

---

## ✅ Checklist Before Deploying

### Prerequisites (Both Options)
- [ ] AWS CLI installed
- [ ] SAM CLI installed  
- [ ] Docker installed
- [ ] AWS credentials configured
- [ ] Cognito User Pool ID obtained

### Option A Specific
- [ ] All Lambda code written in src/*/
- [ ] Updated samconfig.toml with Cognito Pool ID
- [ ] Database password set

### Option B Specific
- [ ] Team assignments clear (who builds what)
- [ ] template-service.yaml shared with teams
- [ ] TEAM_README.md distributed
- [ ] Communication channel set up (Slack)

---

## 🎉 Success Metrics

### Deployment Successful When...

✅ CloudFormation stack shows CREATE_COMPLETE  
✅ Can connect to PostgreSQL  
✅ Can connect to Redis  
✅ API Gateway endpoint responds  
✅ Lambda logs appear in CloudWatch  
✅ X-Ray traces visible  

### System Working When...

✅ Client can call API Gateway  
✅ API Gateway validates Cognito token  
✅ Orchestrator routes to service Lambdas  
✅ Lambdas can read/write databases  
✅ SQS queues process messages  
✅ Dispatcher handles external API calls  

---

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Check CloudWatch alarms
- Review X-Ray traces for errors
- Check SQS DLQ messages

**Monthly:**
- Review AWS costs
- Check RDS performance insights
- Update Lambda runtimes if needed

**As Needed:**
- Scale RDS/ElastiCache for production
- Add Lambda provisioned concurrency
- Optimize slow queries

---

## 📊 Metrics & Monitoring

**CloudWatch Dashboards:**
- API Gateway requests & latency
- Lambda invocations & errors
- SQS queue depth
- RDS connections & CPU
- Fargate task health

**CloudWatch Alarms:**
- API 5XX errors
- Lambda failures
- SQS queue depth > 1000
- RDS CPU > 80%

**X-Ray:**
- End-to-end traces
- Service map
- Bottleneck identification

---

**Questions?** Check the appropriate doc above or reach out to Jason!

## 📄 License

Proprietary - Gauntlet.ai
