# Meridian Split Deployment - Overview

## 🎯 What's Different?

Instead of one giant template with everything, we've split it into:

1. **Base Infrastructure** (Jason deploys once)
   - VPC, databases, queues, S3, etc.
   - File: `template-infrastructure.yaml`

2. **Individual Lambda Services** (Each team deploys their own)
   - One Lambda function per team
   - File: `template-service.yaml` (template for teams to copy)

## 📦 Files You Received

```
meridian-infrastructure/
├── template-infrastructure.yaml    # Base infrastructure template
├── samconfig-infrastructure.toml   # Configuration for infrastructure
├── deploy-infrastructure.sh        # Deployment script for Jason
├── template-service.yaml           # Template for Lambda teams
├── TEAM_README.md                  # Instructions for Lambda teams
├── meridian-architecture.mermaid   # Architecture diagram
└── README.md                       # This file
```

## 🚀 Deployment Flow

### Phase 1: Jason Deploys Base Infrastructure

```bash
./deploy-infrastructure.sh
```

**What gets deployed:**
- ✅ VPC with subnets
- ✅ PostgreSQL (RDS)
- ✅ Redis (ElastiCache)
- ✅ DynamoDB tables
- ✅ SQS queues
- ✅ S3 buckets
- ✅ API Gateway
- ✅ ECS cluster
- ✅ All networking & security

**Time:** 10-15 minutes

**Outputs:** CloudFormation exports that teams will reference

### Phase 2: Teams Deploy Their Lambdas (Parallel)

Each team:
1. Creates their service directory
2. Copies `template-service.yaml`
3. Writes their Lambda code
4. Deploys with `sam deploy`

**Example:**

```bash
# Campaign Management Team
cd campaign-mgmt/
cp ../template-service.yaml template.yaml
# Write code in index.js
sam build
sam deploy --parameter-overrides ServiceName=campaign-mgmt

# Fraud Detection Team
cd fraud-detect/
cp ../template-service.yaml template.yaml
# Write code in index.js
sam build
sam deploy --parameter-overrides ServiceName=fraud-detect

# And so on...
```

**Time:** 2-3 minutes per Lambda

### Phase 3: Jason Wires Everything Together

Once teams have deployed, Jason updates the Orchestrator to call each Lambda by ARN.

## 🔗 How Teams Reference Shared Infrastructure

The infrastructure template **exports** values:

```yaml
Outputs:
  VpcId:
    Export:
      Name: MeridianVpcId-dev
  
  PostgresHost:
    Export:
      Name: MeridianPostgresHost-dev
```

Team templates **import** these values:

```yaml
Environment:
  Variables:
    POSTGRES_HOST: !ImportValue MeridianPostgresHost-dev
```

**No hardcoding!** Everything is dynamically referenced.

## 👥 Team Responsibilities

### Jason (Platform/DevOps)
- ✅ Deploy base infrastructure
- ✅ Create database schemas
- ✅ Deploy Dispatcher (ECS Fargate)
- ✅ Deploy Orchestrator Lambda
- ✅ Wire Orchestrator to team Lambdas
- ✅ Monitor overall system

### Lambda Service Teams
- ✅ Write Lambda function code
- ✅ Deploy their Lambda using template-service.yaml
- ✅ Test their Lambda
- ✅ Provide function ARN to Jason
- ✅ Monitor their service logs

## 📋 Service Contract

All Lambda teams must follow this contract:

### Input Event Format
```javascript
{
  "action": "operation_name",
  "data": { /* operation data */ },
  "user": { 
    "sub": "user-id",
    "email": "user@example.com"
  },
  "mode": "direct" | "agentic"
}
```

### Output Format
```javascript
{
  "success": true | false,
  "result": { /* your data */ },
  "error": "error message" // if success=false
}
```

## 🎨 Service Teams

| Team | Service | Function |
|------|---------|----------|
| **Team A** | Campaign Management | CRUD for campaigns |
| **Team B** | Fraud Detection | Detect fraudulent clicks |
| **Team C** | Bulk Operations | Handle bulk campaign creation |
| **Team D** | Copy Generation | AI-powered ad copy |
| **Team E** | Video Generation | Display video ads |

## 📝 Deployment Checklist

### For Jason (Infrastructure)

- [ ] Get Cognito User Pool ID from auth team
- [ ] Run `./deploy-infrastructure.sh`
- [ ] Wait for deployment (~15 min)
- [ ] Initialize database schema
- [ ] Share environment exports with teams
- [ ] Provide teams with TEAM_README.md
- [ ] Deploy Dispatcher container to ECS

### For Each Lambda Team

- [ ] Read TEAM_README.md
- [ ] Create service directory
- [ ] Copy template-service.yaml
- [ ] Write Lambda code (index.js)
- [ ] Create package.json
- [ ] Deploy: `sam deploy --parameter-overrides ServiceName=YOUR-SERVICE`
- [ ] Test deployed Lambda
- [ ] Send function ARN to Jason

### For Jason (Final Integration)

- [ ] Collect all Lambda ARNs from teams
- [ ] Deploy Orchestrator with ARN mappings
- [ ] Deploy Main API
- [ ] Test end-to-end flow
- [ ] Setup monitoring dashboards

## 🔍 Advantages of This Approach

### ✅ Independent Development
- Teams work in parallel
- No merge conflicts
- Deploy at your own pace

### ✅ Clear Boundaries
- Each team owns their Lambda
- No stepping on each other's toes
- Easy to assign responsibility

### ✅ Faster Iteration
- Update your Lambda without redeploying everything
- Quick rollback if something breaks
- Test independently

### ✅ Better Security
- Teams only have access to their Lambda
- Can set different IAM permissions per team
- Principle of least privilege

### ✅ Easier Debugging
- Issues isolated to specific Lambda
- Clear CloudWatch log groups per service
- X-Ray shows exact Lambda that failed

## 🚨 Important Notes

### Database Password
**NEVER commit the database password to git!**

Jason stores it in AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name meridian/db/password-dev \
  --secret-string "SECURE_PASSWORD"
```

Teams retrieve it in Lambda code:
```javascript
const secret = await secretsManager.getSecretValue({
  SecretId: 'meridian/db/password-dev'
}).promise();
```

### VPC Access
All Lambdas are in VPC to access:
- PostgreSQL (private subnet)
- Redis (private subnet)
- Dispatcher (private subnet via ALB)

This means:
- ⚠️ Slight cold start delay (1-2 sec)
- ⚠️ Need NAT Gateway for internet access
- ✅ Secure private networking

### Cost Implications

**Base Infrastructure (~$86/month dev):**
- RDS: $15
- ElastiCache: $12
- NAT Gateway: $32
- S3/DynamoDB: $5
- Fargate: $15
- Other: $7

**Per Lambda (~$1-5/month):**
- Depends on invocation count
- Most will be <$1 in dev

**Total for 11 Lambdas: ~$90-100/month in dev**

## 📞 Communication

### Daily Standup Questions
1. **What Lambda did you work on?**
2. **Did you deploy?**
3. **Do you need infrastructure changes?**
4. **Any blockers?**

### When to Talk to Jason
- ❓ Need new SQS queue
- ❓ Need new DynamoDB table
- ❓ VPC/networking issues
- ❓ Permission/IAM problems
- ❓ Infrastructure changes needed

### When Teams Work Independently
- ✅ Writing Lambda code
- ✅ Deploying Lambda
- ✅ Testing Lambda
- ✅ Fixing bugs in Lambda
- ✅ Updating Lambda logic

## 🎯 Success Criteria

### Infrastructure Deployment Success
- ✅ All CloudFormation resources created
- ✅ Can connect to PostgreSQL
- ✅ Can connect to Redis
- ✅ SQS queues visible
- ✅ API Gateway endpoint works

### Lambda Deployment Success
- ✅ Function shows in Lambda console
- ✅ Can invoke with test event
- ✅ Logs appear in CloudWatch
- ✅ X-Ray traces visible
- ✅ Can connect to databases

### End-to-End Success
- ✅ API Gateway → Main API → Orchestrator → Your Lambda
- ✅ Lambda can read/write database
- ✅ Lambda can send to SQS
- ✅ Response returns to client

## 📖 Additional Resources

- **AWS SAM Docs:** https://docs.aws.amazon.com/serverless-application-model/
- **Lambda Best Practices:** https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- **CloudFormation Exports:** https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-exports.html
- **VPC Lambda:** https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html

## 🤝 Team Coordination

**Slack Channel:** #meridian-infrastructure  
**Deployment Schedule:** Coordinate in daily standup  
**Jason's Availability:** Ping anytime for infrastructure questions

---

**Questions?** See TEAM_README.md or ask Jason!
