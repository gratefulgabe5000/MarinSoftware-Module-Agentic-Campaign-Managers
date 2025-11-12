# Customer Profiles Database Schema Documentation

**Task**: 1.2.1 - Design Database Schema
**Author**: GABE
**Date**: 2025-01-12
**Version**: 1.0
**Status**: ✅ Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Database Technology](#database-technology)
4. [Schema Structure](#schema-structure)
5. [Table Details](#table-details)
6. [Relationships](#relationships)
7. [Indexing Strategy](#indexing-strategy)
8. [Data Storage Patterns](#data-storage-patterns)
9. [Performance Considerations](#performance-considerations)
10. [Security & Data Integrity](#security--data-integrity)
11. [Versioning & Soft Deletes](#versioning--soft-deletes)
12. [Migration Strategy](#migration-strategy)
13. [Future Enhancements](#future-enhancements)
14. [Usage Examples](#usage-examples)

---

## Overview

This document describes the comprehensive database schema designed for the Customer Profile system in the Agentic Campaign Manager. The schema supports:

- **Target Customer Profiles**: Demographics, interests, behaviors, and personas
- **Brand Guidelines**: Comprehensive brand style guides (Canva-compatible)
- **Budgets**: Campaign budget management with Zilkr Dispatcher compatibility
- **Profile Containers**: Grouping of profiles for account-level management
- **Campaign Usage Tracking**: Junction table for tracking profile usage in campaigns

### Key Requirements

✅ Full versioning support for all profile types
✅ Soft delete functionality
✅ Comprehensive indexing for performance
✅ JSONB support for complex nested data structures
✅ Foreign key relationships with referential integrity
✅ Audit trail (created_by, updated_by, timestamps)
✅ First-time user detection support
✅ Campaign profile usage tracking

---

## Design Philosophy

### 1. **Hybrid Approach: Relational + JSONB**

We use a hybrid approach combining relational database design with PostgreSQL's JSONB capabilities:

- **Relational columns** for frequently queried, simple fields (IDs, names, status, dates)
- **JSONB columns** for complex nested structures (demographics, behavior, color palettes, typography)

**Rationale**: This approach provides the best of both worlds:
- Fast queries on indexed relational columns
- Flexibility to store complex nested data without excessive table normalization
- Ability to query inside JSONB using PostgreSQL's JSON operators
- Schema evolution without migration headaches for nested data

### 2. **Data Modeling Decisions**

#### Why JSONB for Complex Nested Data?

The TypeScript types from Tasks 1.1.1, 1.1.3, and 1.1.5 contain deeply nested structures like:

```typescript
// Example: Demographics contains multiple nested objects
demographics: {
  ageRange: { min: number, max: number },
  location: {
    countries: string[],
    states: string[],
    radius: { latitude: number, longitude: number, radius: number }
  },
  // ... many more nested fields
}
```

**Fully normalizing this would require:**
- 50+ tables for all nested structures
- Complex joins for every query
- Difficult schema evolution
- Performance overhead from excessive joins

**JSONB approach provides:**
- ✅ Single column storage for related data
- ✅ GIN indexing for fast queries inside JSON
- ✅ Schema flexibility (easy to add new fields)
- ✅ Type safety via TypeScript interfaces
- ✅ Partial updates using PostgreSQL's JSON operators

### 3. **Core Design Principles**

1. **Simplicity**: Keep the schema simple and maintainable
2. **Performance**: Index all frequently queried columns
3. **Flexibility**: Use JSONB for data that changes frequently
4. **Safety**: Foreign keys, constraints, and triggers for data integrity
5. **Auditability**: Track who created/updated records and when
6. **Recoverability**: Soft deletes instead of hard deletes

---

## Database Technology

### PostgreSQL

**Version**: 12+ (recommended 14+)

**Why PostgreSQL?**

1. **JSONB Support**: Best-in-class JSON storage with indexing
2. **GIN Indexes**: Fast full-text and JSON search
3. **Array Support**: Native array columns for lists
4. **Triggers & Functions**: Automated timestamp updates and calculations
5. **Foreign Keys**: Strong referential integrity
6. **Text Search**: Built-in full-text search with pg_trgm
7. **Mature & Reliable**: Industry standard for modern web applications

### Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Text search optimization
```

---

## Schema Structure

### Entity Relationship Diagram

```
┌─────────────────────────────┐
│  target_customer_profiles   │
│  ─────────────────────────  │
│  • id (PK, UUID)            │
│  • name                     │
│  • account_id               │
│  • demographics (JSONB)     │
│  • interests (TEXT[])       │
│  • behavior (JSONB)         │
│  • persona (JSONB)          │
│  • version                  │
│  • timestamps + audit       │
└──────────────┬──────────────┘
               │
               │ FK (customer_profile_id)
               │
         ┌─────▼─────────────────────────┐
         │ customer_profile_containers   │
         │ ───────────────────────────── │
         │ • id (PK, UUID)               │
         │ • account_id                  │
         │ • name                        │
         │ • customer_profile_id (FK)    │◄────┐
         │ • brand_guidelines_id (FK)    │◄───┐│
         │ • budget_id (FK)              │◄──┐││
         │ • is_default, is_primary      │   │││
         │ • status, version             │   │││
         │ • timestamps + audit          │   │││
         └────────┬──────────────────────┘   │││
                  │                           │││
                  │ FK (container_id)         │││
                  │                           │││
     ┌────────────▼───────────────────┐      │││
     │ campaign_profile_usage         │      │││
     │ ────────────────────────────── │      │││
     │ • id (PK, UUID)                │      │││
     │ • campaign_id                  │      │││
     │ • container_id (FK, nullable)  │      │││
     │ • customer_profile_id (FK)     │──────┘││
     │ • brand_guidelines_id (FK)     │───────┘│
     │ • budget_id (FK)               │────────┘
     │ • usage_type                   │
     │ • timestamps + audit           │
     └────────────────────────────────┘

┌─────────────────────────────┐
│    brand_guidelines         │
│  ─────────────────────────  │
│  • id (PK, UUID)            │
│  • brand_name               │
│  • account_id               │
│  • detail_level             │
│  • high_level_guidelines    │
│    (JSONB)                  │
│  • full_style_guide (JSONB) │
│  • industry                 │
│  • brand_values (TEXT[])    │
│  • version                  │
│  • timestamps + audit       │
└─────────────────────────────┘

┌─────────────────────────────┐
│         budgets             │
│  ─────────────────────────  │
│  • id (PK, UUID)            │
│  • name                     │
│  • account_id               │
│  • amount                   │
│  • delivery_method          │
│  • period, status, type     │
│  • amount_spent             │
│  • percentage_spent         │
│  • alerts (JSONB)           │
│  • campaign_ids (TEXT[])    │
│  • timestamps + audit       │
└─────────────────────────────┘
```

---

## Table Details

### 1. `target_customer_profiles`

**Purpose**: Store Target Customer Profile data with demographics, interests, behaviors, and persona information.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Profile name (e.g., "Millennial Tech Enthusiasts") |
| `account_id` | VARCHAR(255) | Account this profile belongs to |
| `demographics` | JSONB | Demographic data (age, gender, location, income, etc.) |
| `interests` | TEXT[] | Array of interest strings |
| `behavior` | JSONB | Behavioral data (device preferences, purchase behavior) |
| `persona` | JSONB | Persona details (motivations, pain points, values) |
| `is_default` | BOOLEAN | Whether this is the default profile |
| `is_active` | BOOLEAN | Whether profile is active or archived |
| `version` | INTEGER | Version number for tracking changes |
| `metadata` | JSONB | Additional metadata (tags, notes, source, usage count) |

#### Example JSONB Structure

```json
// demographics JSONB
{
  "ageRange": { "min": 25, "max": 40 },
  "gender": "all",
  "location": {
    "countries": ["US", "CA"],
    "cities": ["San Francisco", "New York"],
    "radius": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 50,
      "unit": "miles"
    }
  },
  "incomeRange": { "min": 75000, "max": 150000 },
  "educationLevel": "bachelors"
}

// behavior JSONB
{
  "devicePreferences": ["mobile", "desktop"],
  "purchaseBehavior": ["frequent_buyer", "high_value_buyer"],
  "onlineActivityLevel": "very_active",
  "socialMediaPlatforms": ["instagram", "linkedin", "twitter"]
}

// persona JSONB
{
  "name": "Tech-Savvy Professional",
  "description": "Young professional interested in latest tech",
  "motivations": ["efficiency", "innovation", "quality"],
  "painPoints": ["lack of time", "information overload"],
  "values": ["quality", "convenience", "sustainability"]
}
```

### 2. `brand_guidelines`

**Purpose**: Store comprehensive brand guidelines compatible with Canva format.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `brand_name` | VARCHAR(255) | Brand name |
| `account_id` | VARCHAR(255) | Account this guideline belongs to |
| `detail_level` | VARCHAR(50) | 'high-level' or 'full' |
| `high_level_guidelines` | JSONB | Quick reference guidelines |
| `full_style_guide` | JSONB | Comprehensive style guide |
| `industry` | VARCHAR(255) | Industry (e.g., "Technology", "Retail") |
| `brand_values` | TEXT[] | Array of brand values |
| `version` | INTEGER | Version number |

#### Example JSONB Structure

```json
// high_level_guidelines JSONB
{
  "logo": {
    "primaryLogoUrl": "https://example.com/logo.svg",
    "usageRules": ["Use on white background", "Maintain clear space"]
  },
  "colors": {
    "primary": [
      { "name": "Brand Blue", "hex": "#0066CC" }
    ]
  },
  "typography": {
    "primaryFont": "Inter",
    "typeSizes": ["16px", "24px", "32px"]
  }
}

// full_style_guide JSONB
{
  "logoGuidelines": {
    "logos": [...],
    "clearSpace": "0.5x logo height",
    "minimumSize": { "width": 120, "height": 40 }
  },
  "colorPalette": {
    "primary": [...],
    "secondary": [...],
    "accent": [...]
  },
  "typographyGuidelines": {
    "primaryFont": {...},
    "typeScale": [...]
  },
  "voiceGuidelines": {
    "brandVoice": "Professional yet approachable",
    "primaryTone": ["professional", "friendly"],
    "messagingPillars": [...]
  }
}
```

### 3. `budgets`

**Purpose**: Store budget configuration and tracking, compatible with Zilkr Dispatcher API.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Budget name |
| `account_id` | VARCHAR(255) | Account this budget belongs to |
| `amount` | DECIMAL(15,2) | Budget amount in dollars |
| `delivery_method` | VARCHAR(50) | 'STANDARD' or 'ACCELERATED' |
| `period` | VARCHAR(50) | Budget period (DAILY, MONTHLY, etc.) |
| `status` | VARCHAR(50) | Budget status (ACTIVE, PAUSED, etc.) |
| `type` | VARCHAR(50) | Budget type (CAMPAIGN, ACCOUNT, etc.) |
| `amount_spent` | DECIMAL(15,2) | Amount spent so far |
| `amount_remaining` | DECIMAL(15,2) | Calculated remaining amount |
| `percentage_spent` | DECIMAL(5,2) | Calculated percentage (0-100) |
| `is_shared` | BOOLEAN | Whether budget is shared across campaigns |
| `campaign_ids` | TEXT[] | Array of campaign IDs using this budget |
| `alerts` | JSONB | Array of budget alert configurations |

#### Automatic Calculations

The schema includes triggers that automatically calculate:
- `amount_remaining` = `amount` - `amount_spent`
- `percentage_spent` = (`amount_spent` / `amount`) * 100

### 4. `customer_profile_containers`

**Purpose**: Group Target Customer Profile, Brand Guidelines, and Budget together for account-level management.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `account_id` | VARCHAR(255) | Account this container belongs to |
| `name` | VARCHAR(255) | Container name |
| `customer_profile_id` | UUID | FK to target_customer_profiles |
| `brand_guidelines_id` | UUID | FK to brand_guidelines |
| `budget_id` | UUID | FK to budgets |
| `is_default` | BOOLEAN | Whether this is the default container |
| `is_primary` | BOOLEAN | Whether this is the primary container |
| `status` | VARCHAR(50) | Container status (ACTIVE, INACTIVE, etc.) |
| `is_complete` | BOOLEAN | Calculated - whether all profile refs exist |
| `missing_profiles` | TEXT[] | Array of missing profile types |
| `version` | INTEGER | Version number |

#### Foreign Key Constraints

All profile references use `ON DELETE RESTRICT` to prevent orphaned containers. This means:
- You cannot delete a profile if it's referenced by a container
- You must first remove the container or update it to reference a different profile

#### Unique Constraints

- Only one default container per account (enforced by unique index)

### 5. `campaign_profile_usage`

**Purpose**: Junction table tracking which campaigns use which customer profiles.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `campaign_id` | VARCHAR(255) | Campaign identifier |
| `container_id` | UUID | FK to customer_profile_containers (nullable) |
| `customer_profile_id` | UUID | FK to target_customer_profiles (nullable) |
| `brand_guidelines_id` | UUID | FK to brand_guidelines (nullable) |
| `budget_id` | UUID | FK to budgets (nullable) |
| `account_id` | VARCHAR(255) | Account for easier querying |
| `usage_type` | VARCHAR(50) | 'CONTAINER', 'INDIVIDUAL', or 'HYBRID' |
| `is_active` | BOOLEAN | Whether this usage record is active |

#### Usage Types

1. **CONTAINER**: Campaign uses all profiles from a container
   - `container_id` must be set
   - Individual profile IDs are NULL

2. **INDIVIDUAL**: Campaign uses individual profiles (not from a container)
   - Individual profile IDs are set
   - `container_id` is NULL

3. **HYBRID**: Campaign uses a container but overrides some profiles
   - Both `container_id` and some individual profile IDs are set

#### Unique Constraints

- Only one active usage record per campaign (enforced by unique index)

---

## Relationships

### Primary Relationships

```
customer_profile_containers
  ├─► target_customer_profiles (customer_profile_id)
  ├─► brand_guidelines (brand_guidelines_id)
  └─► budgets (budget_id)

campaign_profile_usage
  ├─► customer_profile_containers (container_id) [nullable]
  ├─► target_customer_profiles (customer_profile_id) [nullable]
  ├─► brand_guidelines (brand_guidelines_id) [nullable]
  └─► budgets (budget_id) [nullable]
```

### Foreign Key Policies

| Relationship | ON DELETE | ON UPDATE |
|-------------|-----------|-----------|
| Containers → Profiles | RESTRICT | CASCADE |
| Usage → Containers | CASCADE | CASCADE |
| Usage → Profiles | CASCADE | CASCADE |

**RESTRICT**: Prevents deletion if referenced (must remove references first)
**CASCADE**: Automatically updates/deletes dependent records

---

## Indexing Strategy

### Index Types Used

1. **B-tree indexes** (default): For exact matches, ranges, sorting
2. **GIN indexes**: For JSONB, arrays, and full-text search
3. **Partial indexes**: For filtered queries (e.g., WHERE deleted_at IS NULL)
4. **Composite indexes**: For multi-column queries
5. **Unique indexes**: For enforcing uniqueness constraints

### Index Examples

```sql
-- Standard B-tree indexes for foreign keys and common filters
CREATE INDEX idx_containers_account_id ON customer_profile_containers(account_id);

-- GIN indexes for JSONB queries
CREATE INDEX idx_target_customer_profiles_demographics
  ON target_customer_profiles USING GIN (demographics);

-- Partial indexes for soft-deleted records
CREATE INDEX idx_containers_deleted_at
  ON customer_profile_containers(deleted_at)
  WHERE deleted_at IS NULL;

-- Composite indexes for common query patterns
CREATE INDEX idx_containers_account_status
  ON customer_profile_containers(account_id, status, created_at DESC);

-- Text search indexes using trigram (pg_trgm)
CREATE INDEX idx_containers_name_trgm
  ON customer_profile_containers USING gin (name gin_trgm_ops);

-- Unique partial indexes for business rules
CREATE UNIQUE INDEX idx_containers_unique_default_per_account
  ON customer_profile_containers(account_id, is_default)
  WHERE is_default = TRUE AND deleted_at IS NULL;
```

### Querying JSONB Data

```sql
-- Query inside JSONB using operators
SELECT * FROM target_customer_profiles
WHERE demographics->>'gender' = 'female';

-- Query nested JSONB
SELECT * FROM target_customer_profiles
WHERE demographics->'ageRange'->>'min' = '25';

-- Check if JSONB contains key
SELECT * FROM target_customer_profiles
WHERE demographics ? 'location';

-- Full-text search in JSONB
SELECT * FROM brand_guidelines
WHERE full_style_guide @> '{"voiceGuidelines": {"brandVoice": "professional"}}';
```

---

## Data Storage Patterns

### 1. **Relational Columns for Core Fields**

Store frequently queried, simple fields as relational columns:
- IDs, names, account IDs
- Status flags, boolean fields
- Timestamps, dates
- Foreign keys

**Why**: Fast indexed queries, easy filtering and sorting

### 2. **JSONB for Complex Nested Data**

Store complex nested structures as JSONB:
- Demographics object with multiple nested fields
- Brand guidelines with colors, typography, logos
- Behavior object with device preferences and patterns
- Persona object with motivations and pain points

**Why**: Flexibility, schema evolution, reduced table count

### 3. **Arrays for Lists**

Use PostgreSQL array columns for simple lists:
- `interests: TEXT[]` - List of interest strings
- `brand_values: TEXT[]` - List of brand values
- `campaign_ids: TEXT[]` - List of campaign IDs

**Why**: Native support, GIN indexing, simpler than junction tables

### 4. **Metadata JSONB Column**

Every table includes a `metadata` JSONB column for:
- Tags for organization
- Internal notes
- Source tracking (manual, imported, AI-generated)
- Custom fields without schema changes

**Why**: Extensibility without migrations

---

## Performance Considerations

### Query Optimization

1. **Use indexes appropriately**
   - All foreign keys are indexed
   - Common filter columns are indexed
   - Composite indexes for multi-column queries

2. **Avoid SELECT \***
   - Query only needed columns
   - JSONB columns can be large

3. **Use partial indexes**
   - Filter out soft-deleted records at index level
   - Reduces index size and improves performance

4. **Leverage GIN indexes for JSONB**
   - Enable fast queries inside JSON structures
   - Support for containment operators (@>, ?, etc.)

### Scalability Considerations

1. **Partitioning** (future): Consider partitioning large tables by:
   - `account_id` for multi-tenant isolation
   - `created_at` for time-series data

2. **Archiving**: Move old soft-deleted records to archive tables

3. **Read Replicas**: Use PostgreSQL replication for read-heavy workloads

4. **Caching**: Cache frequently accessed profiles at application layer

---

## Security & Data Integrity

### Data Integrity

1. **Foreign Key Constraints**: Enforced referential integrity
2. **Check Constraints**: Validate enum values, ranges, logic
3. **Not Null Constraints**: Required fields cannot be NULL
4. **Unique Constraints**: Prevent duplicate records

### Audit Trail

Every table includes:
- `created_at`: Timestamp when record was created
- `updated_at`: Automatically updated on changes
- `created_by`: User ID who created the record
- `updated_by`: User ID who last updated the record

### Soft Deletes

- `deleted_at`: Timestamp when record was soft-deleted
- NULL = active record
- NOT NULL = soft-deleted record

**Benefits**:
- Data recovery
- Audit history
- Compliance requirements

### Row-Level Security (Future)

Consider implementing PostgreSQL Row-Level Security (RLS) for:
- Multi-tenant data isolation
- User-based access control

---

## Versioning & Soft Deletes

### Version Tracking

All major entities include a `version` INTEGER column:
- Starts at 1 for new records
- Incremented on updates
- Used for optimistic locking
- Tracks change history

### Soft Delete Implementation

```sql
-- Soft delete a record
UPDATE target_customer_profiles
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = 'some-uuid';

-- Query active records only
SELECT * FROM target_customer_profiles
WHERE deleted_at IS NULL;

-- Restore a soft-deleted record
UPDATE target_customer_profiles
SET deleted_at = NULL
WHERE id = 'some-uuid';

-- Hard delete (rare, use with caution)
DELETE FROM target_customer_profiles
WHERE id = 'some-uuid' AND deleted_at IS NOT NULL;
```

### Partial Indexes for Soft Deletes

All tables have partial indexes filtering out soft-deleted records:

```sql
CREATE INDEX idx_table_deleted_at ON table_name(deleted_at)
WHERE deleted_at IS NULL;
```

This ensures queries on active records use indexes efficiently.

---

## Migration Strategy

### Migration File Organization

```
backend/src/database/migrations/
├── 001_create_customer_profiles.sql  ← Initial schema
├── 002_add_new_feature.sql           ← Future migrations
└── 003_alter_table.sql               ← Future migrations
```

### Running Migrations

**Option 1: Manual Execution**
```bash
psql -U username -d database_name -f migrations/001_create_customer_profiles.sql
```

**Option 2: Migration Tool (Recommended)**

Consider using a migration tool like:
- **node-pg-migrate**: Simple, file-based migrations for PostgreSQL
- **Flyway**: Robust migration tool with rollback support
- **Sequelize Migrations**: If you adopt Sequelize ORM

### Rollback Strategy

Create a corresponding rollback file for each migration:

```sql
-- migrations/001_create_customer_profiles_rollback.sql
DROP TABLE IF EXISTS campaign_profile_usage CASCADE;
DROP TABLE IF EXISTS customer_profile_containers CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS brand_guidelines CASCADE;
DROP TABLE IF EXISTS target_customer_profiles CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_budget_remaining() CASCADE;
DROP FUNCTION IF EXISTS calculate_budget_percentage() CASCADE;
DROP FUNCTION IF EXISTS update_container_completeness() CASCADE;
```

### Migration Best Practices

1. **Idempotent**: Use `IF NOT EXISTS` / `IF EXISTS`
2. **Atomic**: Keep migrations atomic (one logical change)
3. **Tested**: Test migrations on development database first
4. **Versioned**: Sequential numbering (001, 002, 003)
5. **Documented**: Include comments explaining what and why

---

## Future Enhancements

### Potential Schema Additions

1. **Profile Version History Table**
   ```sql
   CREATE TABLE profile_version_history (
     id UUID PRIMARY KEY,
     profile_type VARCHAR(50),
     profile_id UUID,
     version INTEGER,
     data JSONB,
     created_at TIMESTAMP,
     created_by VARCHAR(255)
   );
   ```

2. **Profile Templates Table**
   ```sql
   CREATE TABLE profile_templates (
     id UUID PRIMARY KEY,
     template_name VARCHAR(255),
     template_type VARCHAR(50),
     template_data JSONB,
     is_public BOOLEAN,
     created_at TIMESTAMP
   );
   ```

3. **Profile Sharing/Permissions**
   ```sql
   CREATE TABLE profile_permissions (
     id UUID PRIMARY KEY,
     profile_id UUID,
     user_id VARCHAR(255),
     permission_level VARCHAR(50),
     granted_at TIMESTAMP
   );
   ```

4. **Profile Analytics Table**
   ```sql
   CREATE TABLE profile_analytics (
     id UUID PRIMARY KEY,
     profile_id UUID,
     metric_name VARCHAR(100),
     metric_value DECIMAL,
     recorded_at TIMESTAMP
   );
   ```

### Performance Enhancements

1. **Materialized Views** for complex aggregations
2. **Partitioning** for large tables (by account_id or date)
3. **BRIN Indexes** for time-series data
4. **Connection Pooling** (PgBouncer)

### Feature Additions

1. **Full-text Search**: Add tsvector columns for advanced search
2. **Change Data Capture**: Track all changes for audit
3. **Scheduled Backups**: Automated backup strategy
4. **Data Retention Policies**: Automatic archiving of old records

---

## Usage Examples

### 1. Create a Target Customer Profile

```typescript
import { pool } from './database';

async function createCustomerProfile(accountId: string, profileData: any) {
  const query = `
    INSERT INTO target_customer_profiles (
      name, account_id, demographics, interests, behavior, persona, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    profileData.name,
    accountId,
    JSON.stringify(profileData.demographics),
    profileData.interests,
    JSON.stringify(profileData.behavior),
    JSON.stringify(profileData.persona),
    JSON.stringify(profileData.metadata || {})
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}
```

### 2. Query Profiles with JSONB Filtering

```typescript
async function findProfilesByAgeRange(accountId: string, minAge: number, maxAge: number) {
  const query = `
    SELECT *
    FROM target_customer_profiles
    WHERE account_id = $1
      AND deleted_at IS NULL
      AND demographics->'ageRange'->>'min' >= $2
      AND demographics->'ageRange'->>'max' <= $3;
  `;

  const result = await pool.query(query, [accountId, minAge.toString(), maxAge.toString()]);
  return result.rows;
}
```

### 3. Create a Complete Profile Container

```typescript
async function createProfileContainer(containerData: {
  accountId: string;
  name: string;
  customerProfileId: string;
  brandGuidelinesId: string;
  budgetId: string;
}) {
  const query = `
    INSERT INTO customer_profile_containers (
      account_id, name, customer_profile_id, brand_guidelines_id, budget_id, is_default
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    containerData.accountId,
    containerData.name,
    containerData.customerProfileId,
    containerData.brandGuidelinesId,
    containerData.budgetId,
    false // is_default
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}
```

### 4. Get Container with All Profile Details

```typescript
async function getContainerWithProfiles(containerId: string) {
  const query = `
    SELECT
      c.*,
      cp.* as customer_profile,
      bg.* as brand_guidelines,
      b.* as budget
    FROM customer_profile_containers c
    LEFT JOIN target_customer_profiles cp ON c.customer_profile_id = cp.id
    LEFT JOIN brand_guidelines bg ON c.brand_guidelines_id = bg.id
    LEFT JOIN budgets b ON c.budget_id = b.id
    WHERE c.id = $1 AND c.deleted_at IS NULL;
  `;

  const result = await pool.query(query, [containerId]);
  return result.rows[0];
}
```

### 5. Track Campaign Profile Usage

```typescript
async function trackCampaignUsage(campaignId: string, containerId: string, accountId: string) {
  const query = `
    INSERT INTO campaign_profile_usage (
      campaign_id, container_id, account_id, usage_type, is_active
    ) VALUES ($1, $2, $3, 'CONTAINER', true)
    ON CONFLICT (campaign_id) WHERE is_active = true
    DO UPDATE SET
      container_id = EXCLUDED.container_id,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const result = await pool.query(query, [campaignId, containerId, accountId]);
  return result.rows[0];
}
```

### 6. Check First-Time User Status

```typescript
async function checkFirstTimeUser(accountId: string): Promise<AccountProfileStatus> {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM target_customer_profiles WHERE account_id = $1 AND deleted_at IS NULL) as customer_profiles_count,
      (SELECT COUNT(*) FROM brand_guidelines WHERE account_id = $1 AND deleted_at IS NULL) as brand_guidelines_count,
      (SELECT COUNT(*) FROM budgets WHERE account_id = $1 AND deleted_at IS NULL) as budgets_count;
  `;

  const result = await pool.query(query, [accountId]);
  const counts = result.rows[0];

  return {
    accountId,
    isFirstTimeUser: counts.customer_profiles_count === 0 &&
                     counts.brand_guidelines_count === 0 &&
                     counts.budgets_count === 0,
    hasCustomerProfile: counts.customer_profiles_count > 0,
    hasBrandGuidelines: counts.brand_guidelines_count > 0,
    hasBudget: counts.budgets_count > 0,
    profileCounts: counts
  };
}
```

### 7. Update Budget Spent Amount (Auto-calculates remaining and percentage)

```typescript
async function updateBudgetSpent(budgetId: string, amountSpent: number) {
  const query = `
    UPDATE budgets
    SET amount_spent = $2
    WHERE id = $1
    RETURNING *;
  `;

  // Triggers will automatically calculate:
  // - amount_remaining
  // - percentage_spent

  const result = await pool.query(query, [budgetId, amountSpent]);
  return result.rows[0];
}
```

### 8. Soft Delete a Profile

```typescript
async function softDeleteProfile(profileId: string, userId: string) {
  const query = `
    UPDATE target_customer_profiles
    SET deleted_at = CURRENT_TIMESTAMP,
        updated_by = $2
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [profileId, userId]);
  return result.rows[0];
}
```

### 9. Full-Text Search Across Profiles

```typescript
async function searchProfiles(accountId: string, searchTerm: string) {
  const query = `
    SELECT *
    FROM target_customer_profiles
    WHERE account_id = $1
      AND deleted_at IS NULL
      AND (
        name ILIKE $2
        OR description ILIKE $2
        OR interests && ARRAY[$3]
        OR demographics::text ILIKE $2
      )
    ORDER BY created_at DESC
    LIMIT 20;
  `;

  const searchPattern = `%${searchTerm}%`;
  const result = await pool.query(query, [accountId, searchPattern, searchTerm]);
  return result.rows;
}
```

### 10. Get Account Profile Summary

```typescript
async function getAccountProfileSummary(accountId: string) {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM target_customer_profiles WHERE account_id = $1 AND deleted_at IS NULL) as total_profiles,
      (SELECT COUNT(*) FROM brand_guidelines WHERE account_id = $1 AND deleted_at IS NULL) as total_guidelines,
      (SELECT COUNT(*) FROM budgets WHERE account_id = $1 AND deleted_at IS NULL) as total_budgets,
      (SELECT COUNT(*) FROM customer_profile_containers WHERE account_id = $1 AND deleted_at IS NULL) as total_containers,
      (SELECT SUM(amount) FROM budgets WHERE account_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL) as total_active_budget,
      (SELECT COUNT(*) FROM campaign_profile_usage WHERE account_id = $1 AND is_active = true) as total_campaign_usage;
  `;

  const result = await pool.query(query, [accountId]);
  return result.rows[0];
}
```

---

## Conclusion

This comprehensive database schema provides:

✅ **Flexibility**: JSONB for complex nested data
✅ **Performance**: Comprehensive indexing strategy
✅ **Integrity**: Foreign keys and constraints
✅ **Auditability**: Timestamps and user tracking
✅ **Recoverability**: Soft deletes and versioning
✅ **Scalability**: Designed for growth
✅ **Maintainability**: Clear structure and documentation

The schema is ready for implementation and supports all requirements from Tasks 1.1.1, 1.1.3, 1.1.5, and the container types from Task 1.1.7.

---

## Next Steps

1. **Review** this schema with the team ✅
2. **Test** migration on development database
3. **Implement** database connection and query helpers
4. **Create** API endpoints for CRUD operations
5. **Write** integration tests
6. **Deploy** to production

---

**Document Version**: 1.0
**Last Updated**: 2025-01-12
**Author**: GABE
**Status**: Complete ✅
