const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mySurveyDB.sqlite3');


db.run(`CREATE TABLE IF NOT EXISTS product_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT,
  product TEXT,
  message TEXT,
  rating INTEGER,
  timestamp TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT,
  surname TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  timestamp TEXT
)`);
  
  db.close();
  
  console.log("database path:", require('path').resolve('mySurveyDB.sqlite3'));
