-- Contractor Timecard System - Supabase Schema
-- Run this SQL in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  default_hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  url_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on url_token for fast lookups
CREATE INDEX idx_contractors_url_token ON contractors(url_token);
CREATE INDEX idx_contractors_is_active ON contractors(is_active);

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

  -- Calculated total
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approval_1', 'approval_2', 'pending_payment', 'paid')),

  -- Timestamps for status changes
  submitted_at TIMESTAMPTZ,
  approval_1_at TIMESTAMPTZ,
  approval_1_by TEXT,
  approval_2_at TIMESTAMPTZ,
  approval_2_by TEXT,
  paid_at TIMESTAMPTZ,

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

-- Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

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

-- Sample data for testing (optional)
-- Uncomment to insert test contractors

/*
INSERT INTO contractors (name, email, default_hourly_rate, url_token) VALUES
  ('John Smith', 'john@example.com', 75.00, 'abc123'),
  ('Jane Doe', 'jane@example.com', 85.00, 'def456'),
  ('Bob Wilson', 'bob@example.com', 65.00, 'ghi789'),
  ('Alice Johnson', 'alice@example.com', 90.00, 'jkl012'),
  ('Charlie Brown', 'charlie@example.com', 70.00, 'mno345'),
  ('Diana Prince', 'diana@example.com', 80.00, 'pqr678');
*/
