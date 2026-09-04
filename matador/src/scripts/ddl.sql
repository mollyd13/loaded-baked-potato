CREATE TABLE "user" (
	user_id SERIAL PRIMARY KEY,
	fname TEXT NOT NULL,
	lname TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	pwd_hash TEXT UNIQUE NOT NULL,
	-- address TEXT NOT NULL,
	phone INTEGER UNIQUE NOT NULL,
	-- ssn_hash TEXT UNIQUE NOT NULL,
	role_type TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL
);

-- If user places order for another company, UPDATE holding, don't add new row
-- What about crypto and forex???
CREATE TABLE holding (
	holding_id SERIAL PRIMARY KEY,
	user_id SERIAL NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL,
	company TEXT NOT NULL,
	qty INTEGER NOT NULL, --what if fractional shares?
	currency TEXT NOT NULL,
	avg_price NUMERIC(38,2) NOT NULL
);

CREATE TABLE cash (
	cash_account_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	currency TEXT NOT NULL,
	balance NUMERIC(38,2) NOT NULL CHECK (balance >= 0)
);

CREATE TABLE "order" (
	order_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL,
	company TEXT NOT NULL,
	action_type TEXT NOT NULL,
	order_type TEXT NOT NULL,
	qty INTEGER NOT NULL,
	price NUMERIC(38,2) NOT NULL,
	timing TEXT NOT NULL,
	status TEXT NOT NULL,
	submitted_at TIMESTAMP NOT NULL,
	currency TEXT NOT NULL
);

CREATE TABLE trade (
	trade_id SERIAL PRIMARY KEY,
	order_id INTEGER NOT NULL REFERENCES "order"(order_id),
	user_id INTEGER NOT NULL REFERENCES "user"(user_id),
	ticker TEXT NOT NULL,
	company TEXT NOT NULL,
	qty_filled INTEGER NOT NULL,
	settled_price NUMERIC(38,2) NOT NULL,
	traded_at TIMESTAMP NOT NULL,
	-- settled_at TIMESTAMP NOT NULL,
	currency TEXT NOT NULL
);