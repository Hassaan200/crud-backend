const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors()); // This allows ALL origins - use only for testing

const mysql = require('mysql2') 
// const bcrypt = require('bcryptjs');
const dotenv = require('dotenv')

app.use(express.json());
app.use(cors());

const cors = require('cors');




dotenv.config();

const PORT = process.env.PORT
// const HOST = process.env.DB_HOST
// const USER = process.env.DB_USER
// const PASSWORD= process.env.DB_PASSWORD
// const DATABASE = process.env.DB_DATABASE




const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}).promise();

// Connect to the database
db.connect(err=>{
    if(err){
        console.error("error connecting to the database:", err);
    }
    else{
        console.log("connected to the database")
    }

})    



// here are the routes

app.post('/', (req, res)=>{
    console.log('Received POST:', req.body);
    const {Tittle, Description, Amount} = req.body;
     if (!Tittle || !Description || !Amount) {
    return res.status(400).json({ message: 'All fields are required' });
  }
    const sql = 'INSERT INTO items (Tittle, Description, Amount) VALUES (?, ?, ?)';
    db.query(sql, [Tittle, Description, Amount], (err, result )=>{
        if(err){
            console.error("error inserting data:", err);
            res.status(500).json({error: 'Error inserting data'});
        }
        else{
            console.log("data send successfully");
            res.status(200).json({message : 'Data inserted suceessfully', data: result});
        }
    })
})

app.get('/items', async (req, res)=>{
try{
    const [rows] = await db.query('SELECT * FROM items');
        res.json(rows);
    }catch(err){
console.error("error fecthing data:", err)
res.status(500).json({message: 'server error'});
    }

}); 

// route to search items by slected search type by user 


app.get('/search', async (req, res) => {
  const { type, search } = req.query;

  // Validate query
  if (!type || !search) {
    return res.status(400).json({ message: 'Type and search term are required.' });
  }

  // Validate type
  const allowedTypes = ['Tittle', 'Description', 'Amount'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid search type' });
  }

  try {
    const sql = `SELECT * FROM items WHERE ${type} LIKE ?`;
    const [rows] = await db.query(sql, [`%${search}%`]);
    res.json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// now data will be delelted from the database

app.delete('/items/id/:id', (req, res) => {
  const itemId = req.params.id;
console.log('Received DELETE request for item ID:', itemId);
  // Validate itemId
  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required.' });
  }

  const sql = 'DELETE FROM items WHERE id = ?';
  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

app.put('/items/id/:id', (req, res) => {
  const itemId = req.params.id;
  const { Tittle, Description, Amount } = req.body;

  const sql = 'UPDATE items SET Tittle = ?, Description = ?, Amount = ? WHERE id = ?';
  db.query(sql, [Tittle, Description, Amount, itemId], (err, result) => {
    if (err) {
      console.error('Error updating item:', err);
      return res.status(500).json({ message: 'Error updating item' });
    }
    res.status(200).json({ message: 'Item updated successfully' });
  });
});
 

// app.listen(PORT, ()=>{
//     console.log(`Server is running on http://localhost:${PORT}`);
// })
  
module.exports = app;