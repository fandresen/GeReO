-- --------------------------------------------------
-- Table: products (Gestion du Stock - Module B)
-- --------------------------------------------------
CREATE TABLE products (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL UNIQUE,
    reference_code    TEXT,
    purchase_price    REAL DEFAULT 0,
    wholesale_price   REAL DEFAULT 0,
    selling_price     REAL DEFAULT 0,
    current_stock     INTEGER DEFAULT 0,
    min_stock_alert   INTEGER DEFAULT 0
);
CREATE INDEX idx_products_name ON products(name);

-- --------------------------------------------------
-- Table: stock_movements (Gestion du Stock - Module B)
-- --------------------------------------------------
CREATE TABLE stock_movements (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id        INTEGER NOT NULL,
    movement_type     TEXT NOT NULL,
    quantity          INTEGER NOT NULL,
    unit_price        REAL,
    movement_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes             TEXT,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);

-- --------------------------------------------------
-- Table: customers (Gestion des Ventes - Module A)
-- --------------------------------------------------
CREATE TABLE customers (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    phone             TEXT,
    address           TEXT,
    total_debt        REAL DEFAULT 0
);

-- --------------------------------------------------
-- Table: invoices (Gestion des Ventes - Module A)
-- --------------------------------------------------
CREATE TABLE invoices (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id       INTEGER,
    invoice_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount      REAL DEFAULT 0,
    discount          REAL DEFAULT 0,
    amount_paid       REAL DEFAULT 0,
    amount_due        REAL DEFAULT 0,
    status            TEXT DEFAULT 'PAID',
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
);

-- --------------------------------------------------
-- Table: invoice_items (Gestion des Ventes - Module A)
-- --------------------------------------------------
CREATE TABLE invoice_items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id        INTEGER NOT NULL,
    product_id        INTEGER NOT NULL,
    quantity          INTEGER NOT NULL,
    unit_price        REAL NOT NULL,
    total_price       REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- --------------------------------------------------
-- Table: expenses (Gestion des Dépenses - Module C)
-- --------------------------------------------------
CREATE TABLE expenses (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    description       TEXT NOT NULL,
    category          TEXT,
    amount            REAL NOT NULL
);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- --------------------------------------------------
-- Table: cash_movements (Gestion de Caisse - Module D)
-- --------------------------------------------------
CREATE TABLE cash_movements (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    movement_type     TEXT NOT NULL,
    amount            REAL NOT NULL,
    reference_id      INTEGER,
    current_balance   REAL NOT NULL,
    notes             TEXT
);
CREATE INDEX idx_cash_movements_date ON cash_movements(movement_date);

-- --------------------------------------------------
-- Table: settings (Personnalisation - Module A)
-- --------------------------------------------------
CREATE TABLE settings (
    key               TEXT PRIMARY KEY,
    value             TEXT
);

-- Insérer les valeurs par défaut
INSERT INTO settings (key, value) VALUES
('company_name', 'FandrycOMP'),
('company_address', 'Ambohijanaka Antananrivo'),
('company_phone', '0347818742'),
('company_nif', '1545325'),
('company_stat', '05545668'),
('company_logo_path', ''),
('default_printer_type', 'A4');