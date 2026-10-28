-- ==========================================
-- CattleSense PostgreSQL Database Schema
-- Compatible with PostgreSQL 12, 13, 14, 15, 16+
-- ==========================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(50) DEFAULT '',
    full_name VARCHAR(150) DEFAULT 'Cattle Officer',
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT '',
    location VARCHAR(150) DEFAULT '',
    role VARCHAR(50) DEFAULT 'Veterinarian',
    profile_picture VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast authentication and search
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- 2. Create Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id SERIAL PRIMARY KEY,
    user_mobile VARCHAR(150) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    breed VARCHAR(100) DEFAULT 'Unknown',
    confidence VARCHAR(20) DEFAULT '0.0',
    image_url VARCHAR(500) DEFAULT ''
);

-- Indexes for fast scan retrieval and officer history
CREATE INDEX IF NOT EXISTS idx_scans_user_mobile ON scans(user_mobile);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scans_breed ON scans(breed);

-- 3. Seed Default Test User (Password: pass123)
INSERT INTO users (mobile, full_name, email, password_hash, location, role)
VALUES 
('1234567890', 'Dr. Rajesh Kumar', 'test@cattlesense.com', 'pass123', 'National Dairy Research Institute, Karnal', 'Field Officer')
ON CONFLICT (email) DO NOTHING;
