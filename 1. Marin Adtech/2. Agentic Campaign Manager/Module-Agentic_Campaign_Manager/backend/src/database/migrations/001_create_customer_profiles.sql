-- ============================================================================
-- Migration: 001_create_customer_profiles.sql
-- Description: Create comprehensive tables for Customer Profile system
-- Author: GABE
-- Date: 2025-01-12
-- Dependencies: None (initial migration)
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- 1. TARGET CUSTOMER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS target_customer_profiles (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    account_id VARCHAR(255) NOT NULL,

    -- Profile content (stored as JSONB for flexibility and performance)
    demographics JSONB,
    interests TEXT[], -- Array of interest strings
    behavior JSONB,
    persona JSONB,

    -- Status and versioning
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata (stored as JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT target_customer_profiles_name_check CHECK (char_length(name) > 0),
    CONSTRAINT target_customer_profiles_version_check CHECK (version > 0)
);

-- Indexes for target_customer_profiles
CREATE INDEX idx_target_customer_profiles_account_id ON target_customer_profiles(account_id);
CREATE INDEX idx_target_customer_profiles_created_at ON target_customer_profiles(created_at DESC);
CREATE INDEX idx_target_customer_profiles_updated_at ON target_customer_profiles(updated_at DESC);
CREATE INDEX idx_target_customer_profiles_is_active ON target_customer_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_target_customer_profiles_is_default ON target_customer_profiles(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_target_customer_profiles_deleted_at ON target_customer_profiles(deleted_at) WHERE deleted_at IS NULL;

-- JSONB indexes for querying nested data
CREATE INDEX idx_target_customer_profiles_demographics ON target_customer_profiles USING GIN (demographics);
CREATE INDEX idx_target_customer_profiles_behavior ON target_customer_profiles USING GIN (behavior);
CREATE INDEX idx_target_customer_profiles_persona ON target_customer_profiles USING GIN (persona);
CREATE INDEX idx_target_customer_profiles_metadata ON target_customer_profiles USING GIN (metadata);

-- Array index for interests
CREATE INDEX idx_target_customer_profiles_interests ON target_customer_profiles USING GIN (interests);

-- Text search index for name and description
CREATE INDEX idx_target_customer_profiles_name_trgm ON target_customer_profiles USING gin (name gin_trgm_ops);
CREATE INDEX idx_target_customer_profiles_description_trgm ON target_customer_profiles USING gin (description gin_trgm_ops);

-- Composite index for common queries
CREATE INDEX idx_target_customer_profiles_account_active ON target_customer_profiles(account_id, is_active, created_at DESC);

-- ============================================================================
-- 2. BRAND GUIDELINES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_guidelines (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(255) NOT NULL,
    brand_description TEXT,
    account_id VARCHAR(255) NOT NULL,

    -- Guidelines detail level
    detail_level VARCHAR(50) NOT NULL DEFAULT 'high-level',

    -- Guidelines content (stored as JSONB for flexibility)
    high_level_guidelines JSONB,
    full_style_guide JSONB,

    -- Brand context
    industry VARCHAR(255),
    target_audience TEXT,
    brand_values TEXT[], -- Array of brand value strings
    positioning_statement TEXT,
    competitors TEXT[], -- Array of competitor names

    -- Status and versioning
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata (stored as JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT brand_guidelines_brand_name_check CHECK (char_length(brand_name) > 0),
    CONSTRAINT brand_guidelines_detail_level_check CHECK (detail_level IN ('high-level', 'full')),
    CONSTRAINT brand_guidelines_version_check CHECK (version > 0)
);

-- Indexes for brand_guidelines
CREATE INDEX idx_brand_guidelines_account_id ON brand_guidelines(account_id);
CREATE INDEX idx_brand_guidelines_created_at ON brand_guidelines(created_at DESC);
CREATE INDEX idx_brand_guidelines_updated_at ON brand_guidelines(updated_at DESC);
CREATE INDEX idx_brand_guidelines_is_active ON brand_guidelines(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_brand_guidelines_detail_level ON brand_guidelines(detail_level);
CREATE INDEX idx_brand_guidelines_deleted_at ON brand_guidelines(deleted_at) WHERE deleted_at IS NULL;

-- JSONB indexes for querying nested data
CREATE INDEX idx_brand_guidelines_high_level ON brand_guidelines USING GIN (high_level_guidelines);
CREATE INDEX idx_brand_guidelines_full_style ON brand_guidelines USING GIN (full_style_guide);
CREATE INDEX idx_brand_guidelines_metadata ON brand_guidelines USING GIN (metadata);

-- Array indexes
CREATE INDEX idx_brand_guidelines_brand_values ON brand_guidelines USING GIN (brand_values);
CREATE INDEX idx_brand_guidelines_competitors ON brand_guidelines USING GIN (competitors);

-- Text search indexes
CREATE INDEX idx_brand_guidelines_brand_name_trgm ON brand_guidelines USING gin (brand_name gin_trgm_ops);
CREATE INDEX idx_brand_guidelines_industry_trgm ON brand_guidelines USING gin (industry gin_trgm_ops);

-- Composite index for common queries
CREATE INDEX idx_brand_guidelines_account_active ON brand_guidelines(account_id, is_active, created_at DESC);

-- ============================================================================
-- 3. BUDGETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,

    -- Budget configuration
    amount DECIMAL(15, 2) NOT NULL, -- Amount in dollars with 2 decimal places
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    period VARCHAR(50) NOT NULL DEFAULT 'DAILY',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    type VARCHAR(50) NOT NULL DEFAULT 'CAMPAIGN',
    currency VARCHAR(3) DEFAULT 'USD',

    -- Date range
    start_date DATE,
    end_date DATE,

    -- Shared budget configuration
    is_shared BOOLEAN DEFAULT FALSE,
    campaign_ids TEXT[], -- Array of campaign IDs using this budget

    -- Budget tracking
    amount_spent DECIMAL(15, 2) DEFAULT 0.00,
    amount_remaining DECIMAL(15, 2),
    percentage_spent DECIMAL(5, 2) DEFAULT 0.00,
    utilization_rate DECIMAL(10, 4),

    -- Auto-replenish configuration
    auto_replenish BOOLEAN DEFAULT FALSE,

    -- Alerts configuration (stored as JSONB array)
    alerts JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata (stored as JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT budgets_name_check CHECK (char_length(name) > 0),
    CONSTRAINT budgets_amount_check CHECK (amount >= 0),
    CONSTRAINT budgets_amount_spent_check CHECK (amount_spent >= 0),
    CONSTRAINT budgets_percentage_spent_check CHECK (percentage_spent >= 0 AND percentage_spent <= 100),
    CONSTRAINT budgets_delivery_method_check CHECK (delivery_method IN ('STANDARD', 'ACCELERATED')),
    CONSTRAINT budgets_period_check CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CAMPAIGN_TOTAL', 'CUSTOM')),
    CONSTRAINT budgets_status_check CHECK (status IN ('ACTIVE', 'PAUSED', 'EXHAUSTED', 'EXPIRED', 'REMOVED')),
    CONSTRAINT budgets_type_check CHECK (type IN ('CAMPAIGN', 'ADGROUP', 'ACCOUNT', 'PORTFOLIO', 'EXPERIMENT')),
    CONSTRAINT budgets_date_range_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Indexes for budgets
CREATE INDEX idx_budgets_account_id ON budgets(account_id);
CREATE INDEX idx_budgets_created_at ON budgets(created_at DESC);
CREATE INDEX idx_budgets_updated_at ON budgets(updated_at DESC);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_type ON budgets(type);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_deleted_at ON budgets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_is_shared ON budgets(is_shared) WHERE is_shared = TRUE;

-- JSONB indexes
CREATE INDEX idx_budgets_alerts ON budgets USING GIN (alerts);
CREATE INDEX idx_budgets_metadata ON budgets USING GIN (metadata);

-- Array index for campaign_ids
CREATE INDEX idx_budgets_campaign_ids ON budgets USING GIN (campaign_ids);

-- Text search index
CREATE INDEX idx_budgets_name_trgm ON budgets USING gin (name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_budgets_account_status ON budgets(account_id, status, created_at DESC);
CREATE INDEX idx_budgets_account_type ON budgets(account_id, type, created_at DESC);
CREATE INDEX idx_budgets_amount ON budgets(amount DESC);
CREATE INDEX idx_budgets_percentage_spent ON budgets(percentage_spent DESC);

-- Date range index for querying active budgets
CREATE INDEX idx_budgets_date_range ON budgets(start_date, end_date) WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. CUSTOMER PROFILE CONTAINERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_profile_containers (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Profile references (Foreign Keys)
    customer_profile_id UUID NOT NULL,
    brand_guidelines_id UUID NOT NULL,
    budget_id UUID NOT NULL,

    -- Container configuration
    is_default BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    version INTEGER DEFAULT 1,

    -- Container completeness tracking
    is_complete BOOLEAN DEFAULT FALSE,
    missing_profiles TEXT[], -- Array of missing profile types

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Metadata (stored as JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT customer_profile_containers_name_check CHECK (char_length(name) > 0),
    CONSTRAINT customer_profile_containers_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT')),
    CONSTRAINT customer_profile_containers_version_check CHECK (version > 0),

    -- Foreign Key constraints (with ON DELETE RESTRICT to prevent orphaned containers)
    CONSTRAINT fk_customer_profile
        FOREIGN KEY (customer_profile_id)
        REFERENCES target_customer_profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_brand_guidelines
        FOREIGN KEY (brand_guidelines_id)
        REFERENCES brand_guidelines(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_budget
        FOREIGN KEY (budget_id)
        REFERENCES budgets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Indexes for customer_profile_containers
CREATE INDEX idx_containers_account_id ON customer_profile_containers(account_id);
CREATE INDEX idx_containers_created_at ON customer_profile_containers(created_at DESC);
CREATE INDEX idx_containers_updated_at ON customer_profile_containers(updated_at DESC);
CREATE INDEX idx_containers_status ON customer_profile_containers(status);
CREATE INDEX idx_containers_is_default ON customer_profile_containers(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_containers_is_primary ON customer_profile_containers(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_containers_is_complete ON customer_profile_containers(is_complete);
CREATE INDEX idx_containers_deleted_at ON customer_profile_containers(deleted_at) WHERE deleted_at IS NULL;

-- Foreign key indexes for joins
CREATE INDEX idx_containers_customer_profile_id ON customer_profile_containers(customer_profile_id);
CREATE INDEX idx_containers_brand_guidelines_id ON customer_profile_containers(brand_guidelines_id);
CREATE INDEX idx_containers_budget_id ON customer_profile_containers(budget_id);

-- JSONB index
CREATE INDEX idx_containers_metadata ON customer_profile_containers USING GIN (metadata);

-- Array index
CREATE INDEX idx_containers_missing_profiles ON customer_profile_containers USING GIN (missing_profiles);

-- Text search index
CREATE INDEX idx_containers_name_trgm ON customer_profile_containers USING gin (name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_containers_account_status ON customer_profile_containers(account_id, status, created_at DESC);
CREATE INDEX idx_containers_account_default ON customer_profile_containers(account_id, is_default) WHERE is_default = TRUE;

-- Unique constraint: Only one default container per account
CREATE UNIQUE INDEX idx_containers_unique_default_per_account
    ON customer_profile_containers(account_id, is_default)
    WHERE is_default = TRUE AND deleted_at IS NULL;

-- ============================================================================
-- 5. CAMPAIGN PROFILE USAGE TABLE (Junction Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_profile_usage (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign reference
    campaign_id VARCHAR(255) NOT NULL,

    -- Profile container reference (optional - campaign may use individual profiles)
    container_id UUID,

    -- Individual profile references (optional - campaign may use container)
    customer_profile_id UUID,
    brand_guidelines_id UUID,
    budget_id UUID,

    -- Account for easier querying
    account_id VARCHAR(255) NOT NULL,

    -- Usage tracking
    usage_type VARCHAR(50) NOT NULL DEFAULT 'CONTAINER',
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(255),

    -- Metadata for usage tracking
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT campaign_profile_usage_type_check CHECK (usage_type IN ('CONTAINER', 'INDIVIDUAL', 'HYBRID')),

    -- Foreign Key constraints (with ON DELETE CASCADE since usage records can be deleted if profiles are deleted)
    CONSTRAINT fk_usage_container
        FOREIGN KEY (container_id)
        REFERENCES customer_profile_containers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usage_customer_profile
        FOREIGN KEY (customer_profile_id)
        REFERENCES target_customer_profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usage_brand_guidelines
        FOREIGN KEY (brand_guidelines_id)
        REFERENCES brand_guidelines(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usage_budget
        FOREIGN KEY (budget_id)
        REFERENCES budgets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Ensure either container_id OR individual profile IDs are set
    CONSTRAINT campaign_profile_usage_profiles_check CHECK (
        (usage_type = 'CONTAINER' AND container_id IS NOT NULL) OR
        (usage_type = 'INDIVIDUAL' AND (customer_profile_id IS NOT NULL OR brand_guidelines_id IS NOT NULL OR budget_id IS NOT NULL)) OR
        (usage_type = 'HYBRID' AND container_id IS NOT NULL AND (customer_profile_id IS NOT NULL OR brand_guidelines_id IS NOT NULL OR budget_id IS NOT NULL))
    )
);

-- Indexes for campaign_profile_usage
CREATE INDEX idx_usage_campaign_id ON campaign_profile_usage(campaign_id);
CREATE INDEX idx_usage_account_id ON campaign_profile_usage(account_id);
CREATE INDEX idx_usage_created_at ON campaign_profile_usage(created_at DESC);
CREATE INDEX idx_usage_is_active ON campaign_profile_usage(is_active) WHERE is_active = TRUE;

-- Foreign key indexes
CREATE INDEX idx_usage_container_id ON campaign_profile_usage(container_id);
CREATE INDEX idx_usage_customer_profile_id ON campaign_profile_usage(customer_profile_id);
CREATE INDEX idx_usage_brand_guidelines_id ON campaign_profile_usage(brand_guidelines_id);
CREATE INDEX idx_usage_budget_id ON campaign_profile_usage(budget_id);

-- JSONB index
CREATE INDEX idx_usage_metadata ON campaign_profile_usage USING GIN (metadata);

-- Composite indexes for common queries
CREATE INDEX idx_usage_campaign_active ON campaign_profile_usage(campaign_id, is_active);
CREATE INDEX idx_usage_account_campaign ON campaign_profile_usage(account_id, campaign_id);

-- Unique constraint: One active usage record per campaign
CREATE UNIQUE INDEX idx_usage_unique_active_per_campaign
    ON campaign_profile_usage(campaign_id)
    WHERE is_active = TRUE;

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_target_customer_profiles_updated_at
    BEFORE UPDATE ON target_customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_guidelines_updated_at
    BEFORE UPDATE ON brand_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profile_containers_updated_at
    BEFORE UPDATE ON customer_profile_containers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_profile_usage_updated_at
    BEFORE UPDATE ON campaign_profile_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate budget remaining amount
CREATE OR REPLACE FUNCTION calculate_budget_remaining()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount_remaining = NEW.amount - COALESCE(NEW.amount_spent, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to budgets table
CREATE TRIGGER calculate_budgets_remaining
    BEFORE INSERT OR UPDATE OF amount, amount_spent ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_budget_remaining();

-- Function to calculate budget percentage spent
CREATE OR REPLACE FUNCTION calculate_budget_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount > 0 THEN
        NEW.percentage_spent = ROUND((COALESCE(NEW.amount_spent, 0) / NEW.amount) * 100, 2);
    ELSE
        NEW.percentage_spent = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to budgets table
CREATE TRIGGER calculate_budgets_percentage
    BEFORE INSERT OR UPDATE OF amount, amount_spent ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_budget_percentage();

-- Function to update container completeness
CREATE OR REPLACE FUNCTION update_container_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_complete = (
        NEW.customer_profile_id IS NOT NULL AND
        NEW.brand_guidelines_id IS NOT NULL AND
        NEW.budget_id IS NOT NULL
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to containers table
CREATE TRIGGER update_containers_completeness
    BEFORE INSERT OR UPDATE OF customer_profile_id, brand_guidelines_id, budget_id ON customer_profile_containers
    FOR EACH ROW
    EXECUTE FUNCTION update_container_completeness();

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE target_customer_profiles IS 'Stores Target Customer Profile data with demographics, interests, behaviors, and persona information for campaign targeting';
COMMENT ON TABLE brand_guidelines IS 'Stores comprehensive Brand Guidelines including colors, typography, logos, imagery, and voice guidelines';
COMMENT ON TABLE budgets IS 'Stores budget configuration and tracking data compatible with Zilkr Dispatcher API';
COMMENT ON TABLE customer_profile_containers IS 'Groups Target Customer Profile, Brand Guidelines, and Budget together for account-level management';
COMMENT ON TABLE campaign_profile_usage IS 'Junction table tracking which campaigns use which customer profiles (via containers or individual profiles)';

COMMENT ON COLUMN target_customer_profiles.demographics IS 'JSONB storing demographic targeting data (age, gender, location, income, etc.)';
COMMENT ON COLUMN target_customer_profiles.behavior IS 'JSONB storing behavioral targeting data (device preferences, purchase behavior, etc.)';
COMMENT ON COLUMN target_customer_profiles.persona IS 'JSONB storing detailed customer persona information (motivations, pain points, values, etc.)';
COMMENT ON COLUMN brand_guidelines.high_level_guidelines IS 'JSONB storing quick reference brand guidelines (Canva high-level format)';
COMMENT ON COLUMN brand_guidelines.full_style_guide IS 'JSONB storing comprehensive brand style guide (Canva full format)';
COMMENT ON COLUMN budgets.alerts IS 'JSONB array storing budget alert configurations';
COMMENT ON COLUMN customer_profile_containers.is_complete IS 'Boolean indicating if container has all required profile references';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
