-- Contractor Timecard System - Supabase Schema
-- Run this SQL in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  address TEXT,
  phone TEXT,
  default_hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  url_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on url_token for fast lookups
CREATE INDEX idx_contractors_url_token ON contractors(url_token);
CREATE INDEX idx_contractors_is_active ON contractors(is_active);

-- Admin users / Approvers table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url_token TEXT UNIQUE NOT NULL,
  approval_level INTEGER NOT NULL CHECK (approval_level IN (1, 2)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_url_token ON admin_users(url_token);
CREATE INDEX idx_admin_users_approval_level ON admin_users(approval_level);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Pay period dates
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,

  -- Week 1 details
  week_1_start DATE NOT NULL,
  week_1_end DATE NOT NULL,
  week_1_hours DECIMAL(6, 2) NOT NULL DEFAULT 0,
  week_1_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  week_1_notes TEXT,

  -- Week 2 details
  week_2_start DATE NOT NULL,
  week_2_end DATE NOT NULL,
  week_2_hours DECIMAL(6, 2) NOT NULL DEFAULT 0,
  week_2_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  week_2_notes TEXT,

  -- Tax (optional)
  tax_rate DECIMAL(10, 5),
  tax_amount DECIMAL(12, 2),

  -- Calculated total (includes tax if applicable)
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approval_1', 'approval_2', 'pending_payment', 'paid', 'rejected')),

  -- Timestamps for status changes
  submitted_at TIMESTAMPTZ,
  approval_1_at TIMESTAMPTZ,
  approval_1_by TEXT,
  approval_2_at TIMESTAMPTZ,
  approval_2_by TEXT,
  paid_at TIMESTAMPTZ,

  -- Rejection tracking
  rejection_reason TEXT,
  rejected_by TEXT,
  rejected_at TIMESTAMPTZ,

  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one invoice per contractor per pay period
  UNIQUE(contractor_id, pay_period_start)
);

-- Create indexes for common queries
CREATE INDEX idx_invoices_contractor_id ON invoices(contractor_id);
CREATE INDEX idx_invoices_pay_period_start ON invoices(pay_period_start);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_contractor_period ON invoices(contractor_id, pay_period_start);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to contractors by url_token
CREATE POLICY "Allow public read contractors by token"
  ON contractors FOR SELECT
  USING (true);

-- Policy: Allow public read/insert/update invoices
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow public read invoices"
  ON invoices FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update invoices"
  ON invoices FOR UPDATE
  USING (true);

-- Policy: Allow public read admin_users
CREATE POLICY "Allow public read admin_users"
  ON admin_users FOR SELECT
  USING (true);

-- Initial contractor data
INSERT INTO contractors (name, email, company, address, phone, default_hourly_rate, url_token) VALUES
  ('Dave Lopez', 'dave@veexphoto.com', 'Veex Photo LLC', '1631 Kapiolani Blvd. #806 Honolulu, HI 96814', '808-232-6959', 75.00, 'veex-dave');

-- Sample approvers (customize these for your organization)
INSERT INTO admin_users (name, email, url_token, approval_level) VALUES
  ('Nick', 'nick@invizarts.com', 'nick-approve', 1),
  ('Chris', 'cmapes@invizarts.com', 'chris-approve', 2);

-- ===========================================
-- MIGRATION: Run these on existing database
-- ===========================================
/*
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  url_token TEXT UNIQUE NOT NULL,
  approval_level INTEGER NOT NULL CHECK (approval_level IN (1, 2)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_url_token ON admin_users(url_token);
CREATE INDEX IF NOT EXISTS idx_admin_users_approval_level ON admin_users(approval_level);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read admin_users" ON admin_users FOR SELECT USING (true);

-- Add rejection columns to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS rejected_by TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Update status constraint to include 'rejected'
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('pending', 'submitted', 'approval_1', 'approval_2', 'pending_payment', 'paid', 'rejected'));

-- Insert sample approvers
INSERT INTO admin_users (name, email, url_token, approval_level) VALUES
  ('Nick', 'nick@invizarts.com', 'nick-approve', 1),
  ('Chris', 'cmapes@invizarts.com', 'chris-approve', 2);
*/
