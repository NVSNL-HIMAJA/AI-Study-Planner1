CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    exam_date DATE,
    confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10)
);