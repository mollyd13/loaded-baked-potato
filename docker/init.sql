-- PostgreSQL initialization script for 'primary' database
-- This script runs automatically when the PostgreSQL container starts
-- Located at: docker/init.sql

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set session defaults
SET timezone = 'UTC';

-- Create main application schema
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions to postgres user
GRANT USAGE ON SCHEMA app TO postgres;
GRANT CREATE ON SCHEMA app TO postgres;

-- Example: Create audit log table
-- Uncomment and modify as needed for your application
-- CREATE TABLE IF NOT EXISTS app.audit_log (
--     id SERIAL PRIMARY KEY,
--     table_name VARCHAR(255),
--     operation VARCHAR(10),
--     user_id UUID,
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app.user_profile (
	user_id SERIAL PRIMARY KEY,
	fname TEXT NOT NULL,
	lname TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	pwd_hash TEXT NOT NULL,
	phone TEXT UNIQUE NOT NULL,
	role_type TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted_at TIMESTAMP
);

-- Holds only equities and crypto
-- If user places order for another company, UPDATE holding, don't add new row
CREATE TABLE IF NOT EXISTS app.holding (
	holding_id SERIAL PRIMARY KEY,
	user_id SERIAL NOT NULL REFERENCES app.user_profile(user_id),
	ticker TEXT NOT NULL, -- aapl, btc
	asset_type TEXT NOT NULL, -- equity, crypto but NOT FX
	qty INTEGER NOT NULL, --what if fractional shares?
	currency TEXT NOT NULL,
	avg_price NUMERIC(38,2) NOT NULL
);

-- Holds cash balance and forex like an asset instead of holding table
CREATE TABLE IF NOT EXISTS app.cash (
	cash_account_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES app.user_profile(user_id),
	currency TEXT NOT NULL,
	balance NUMERIC(38,2) NOT NULL CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS app."order" (
	order_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES app.user_profile(user_id),
	ticker TEXT NOT NULL, -- aapl/btc/eurusd
	asset_type TEXT NOT NULL, -- equity/crypto/fx
	action_type TEXT NOT NULL, -- buy/sell
	order_type TEXT NOT NULL, -- market/limit
	qty INTEGER NOT NULL, -- for forex: qty of base currency
	price NUMERIC(38,2) NOT NULL,
	timing TEXT NOT NULL, -- day/gtc
	order_status TEXT NOT NULL,
	submitted_at TIMESTAMP NOT NULL,
	currency TEXT NOT NULL -- for forex: quote currency
);

-- ticker = EURUSD
-- asset_type = FX
-- action_type = BUY
-- qty = 1000
-- price = 1.1
-- currency = USD
-- this means gain 1000 eur and lose 1100 usd
-- EUR is base currency and USD is quote currency

-- ticker = EURUSD
-- asset_type = FX
-- action_type = SELL
-- qty = 1000
-- price = 1.1
-- currency = USD
-- this means lose 1000 eur and gain 1100 usd

-- ticker = USDEUR
-- asset_type = FX
-- action_type = BUY
-- qty = 1000
-- price = 0.91
-- currency = EUR
-- this means gain 1000 usd and lose 910 eur

-- ticker = USDEUR
-- asset_type = FX
-- action_type = SELL
-- qty = 1000
-- price = 0.91
-- currency = EUR
-- this means lose 1000 usd and gain 910 eur

CREATE TABLE IF NOT EXISTS app.trade (
	trade_id SERIAL PRIMARY KEY,
	order_id INTEGER NOT NULL REFERENCES app."order"(order_id),
	user_id INTEGER NOT NULL REFERENCES app.user_profile(user_id),
	ticker TEXT NOT NULL, -- aapl/btc/eurusd
	asset_type TEXT NOT NULL, -- equity/crypto/fx
	action_type TEXT NOT NULL, -- buy/sell
	qty INTEGER NOT NULL, -- for forex: qty of base currency, NO PARTIAL FILLS (all or none)
	price NUMERIC(38,2) NOT NULL, -- actual execution value
	currency TEXT NOT NULL, -- for forex: quote currency
    fee NUMERIC(38, 2) NOT NULL,
	executed_at TIMESTAMP NOT NULL -- update cash and holdings IMMEDIATELY when trade executes
);
-------------------------------------------------------------------------------------------------


-- Verify database was created successfully
SELECT datname, datistemplate FROM pg_database WHERE datname = 'primary';