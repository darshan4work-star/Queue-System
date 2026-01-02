-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE, -- Admin login
    password_hash VARCHAR(255), -- For simple auth
    name VARCHAR(100) NOT NULL,
    shop_id VARCHAR(50) UNIQUE NOT NULL, -- Short ID for URLs (e.g. 'store1')
    logo_url TEXT,
    custom_message TEXT,
    avg_service_time INT DEFAULT 5, -- Minutes
    is_paused BOOLEAN DEFAULT FALSE,
    current_token_number VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    business_type VARCHAR(50)
);

-- Vendor Custom Forms
CREATE TABLE IF NOT EXISTS vendor_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID UNIQUE REFERENCES vendors(id),
    fields JSONB DEFAULT '[]', -- Array of field objects { label, type, options, required }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Customers (CRM)
CREATE TABLE IF NOT EXISTS vendor_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    phone_number VARCHAR(20) NOT NULL,
    profile_data JSONB DEFAULT '{}', -- Stores custom form data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, phone_number)
);

-- Tokens/Queue Table
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    token_number VARCHAR(10) NOT NULL, -- e.g. A01
    user_phone_number VARCHAR(20), -- User's phone
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SERVING, COMPLETED, SKIPPED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tokens_vendor_status ON tokens(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at);

-- Daily Reset Function (Optional, can be done via cron/logic)
-- But we will handle reset in application logic to keep SQL simple for now.
