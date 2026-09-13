CREATE TABLE "user" (
	user_id SERIAL PRIMARY KEY,
	fname TEXT NOT NULL,
	lname TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	pwd_hash TEXT UNIQUE NOT NULL,
	phone INTEGER UNIQUE NOT NULL,
	role_type TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL
);

-- Holds only equities and crypto
-- If user places order for another company, UPDATE holding, don't add new row
CREATE TABLE holding (
	holding_id SERIAL PRIMARY KEY,
	user_id SERIAL NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL, -- aapl, btc
	asset_type TEXT NOT NULL, -- equity, crypto but NOT FX
	qty INTEGER NOT NULL, --what if fractional shares?
	currency TEXT NOT NULL,
	avg_price NUMERIC(38,2) NOT NULL
);

-- Holds cash balance and forex like an asset instead of holding table
CREATE TABLE cash (
	cash_account_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	currency TEXT NOT NULL,
	balance NUMERIC(38,2) NOT NULL CHECK (balance >= 0)
);

CREATE TABLE "order" (
	order_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL, -- aapl/btc/eurusd
	asset_type TEXT NOT NULL, -- equity/crypto/fx
	action_type TEXT NOT NULL, -- buy/sell
	order_type TEXT NOT NULL, -- market/limit
	qty INTEGER NOT NULL, -- for forex: qty of base currency
	price NUMERIC(38,2) NOT NULL,
	timing TEXT NOT NULL, -- day/gtc
	status TEXT NOT NULL,
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

CREATE TABLE trade (
	trade_id SERIAL PRIMARY KEY.
	order_id INTEGER NOT NULL REFERENCES "order"(order_id),
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL, -- aapl/btc/eurusd
	asset_type TEXT NOT NULL, -- equity/crypto/fx
	action_type TEXT NOT NULL, -- buy/sell
	qty INTEGER NOT NULL, -- for forex: qty of base currency, NO PARTIAL FILLS (all or none)
	price NUMERIC(38,2) NOT NULL, -- actual execution value
	currency TEXT NOT NULL -- for forex: quote currency,
	executed_at TIMESTAMP NOT NULL -- update cash and holdings IMMEDIATELY when trade executes
);