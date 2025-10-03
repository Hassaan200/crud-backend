const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS Configuration - FIXED: removed trailing slash
app.use(cors({
  origin: ['https://crud-frontend-lilac.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// Database connection with promise
let db;

const initDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
};

initDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// POST - Create item
app.post('/items', async (req, res) => {
  try {
    console.log('Received POST:', req.body);
    const { Tittle, Description, Amount } = req.body;
    
    if (!Tittle || !Description || !Amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const sql = 'INSERT INTO items (Tittle, Description, Amount) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [Tittle, Description, Amount]);
    
    res.status(200).json({ message: 'Data inserted successfully', data: result });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ error: 'Error inserting data' });
  }
});

// GET - Fetch all items
app.get('/items', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items');
    res.json(rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Search items
app.get('/search', async (req, res) => {
  try {
    const { type, search } = req.query;

    if (!type || !search) {
      return res.status(400).json({ message: 'Type and search term are required.' });
    }

    const allowedTypes = ['Tittle', 'Description', 'Amount'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid search type' });
    }

    const sql = `SELECT * FROM items WHERE ${type} LIKE ?`;
    const [rows] = await db.query(sql, [`%${search}%`]);
    res.json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE - Delete item
app.delete('/items/id/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log('Received DELETE request for item ID:', itemId);

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required.' });
    }

    const sql = 'DELETE FROM items WHERE id = ?';
    const [result] = await db.query(sql, [itemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT - Update item
app.put('/items/id/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { Tittle, Description, Amount } = req.body;

    const sql = 'UPDATE items SET Tittle = ?, Description = ?, Amount = ? WHERE id = ?';
    const [result] = await db.query(sql, [Tittle, Description, Amount, itemId]);

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Error updating item' });
  }
});

module.exports = app;