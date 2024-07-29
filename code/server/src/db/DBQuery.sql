DROP TABLE IF EXISTS cart_products;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;

-- Create USER table
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    address TEXT NOT NULL,
    birthdate TEXT NOT NULL
);

-- Create PRODUCTS table
CREATE TABLE products (
    model VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    arrival_date DATE,
    selling_price DECIMAL(10, 2) NOT NULL,
    details TEXT,
    quantity INT NOT NULL
);

-- Create REVIEW table
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user VARCHAR(50) NOT NULL, --REFERENCES users(username) NOT NULL,
    model VARCHAR(50) NOT NULL, --REFERENCES products(model) NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    date DATE NOT NULL,
    comment TEXT NOT NULL
);

-- Create CARTS table
CREATE TABLE carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user VARCHAR(50) NOT NULL, --REFERENCES users(username) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATE,
    total DECIMAL(10, 2) NOT NULL
);

-- Create CART_PRODUCTS table
CREATE TABLE cart_products (
    cart_id INTEGER NOT NULL, --REFERENCES carts(id),
    model VARCHAR(50) NOT NULL, --REFERENCES products(model),
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, model)
);

-- Insert sample products
INSERT INTO products (model, category, arrival_date, selling_price, quantity, details) VALUES 
('Laptop123', 'Electronics', '2024-05-01', 999.99, 50, '15" laptop with 16GB RAM and 1TB SSD'),
('Phone456', 'Electronics', '2024-05-10', 699.99, 200, '6.5" phone with 8GB RAM and 256GB storage');

-- Insert sample reviews
INSERT INTO reviews (user, model, score, date, comment) VALUES 
('john_doe', 'Laptop123', 5, '2024-05-20', 'Excellent laptop, very fast and reliable.'),
('jane_smith', 'Phone456', 4, '2024-05-21', 'Great phone with amazing features.');

-- Insert sample carts
INSERT INTO carts (user, paid, payment_date, total) VALUES 
('john_doe', TRUE, '2024-05-20', 999.99),
('jane_smith', FALSE, NULL, 0.00);
