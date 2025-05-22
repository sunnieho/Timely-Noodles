const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
const port = 3000;

// set view engine
app.set('view engine', 'ejs');

// middleware
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public_html'));

// session
app.use(session({
  secret: 'timely-noodles-secret',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn || false;
  next();
});

//create the database connection
const db = new sqlite3.Database('mySurveyDB.sqlite3', (err) => {
  if (err) {
    console.error("DB Connection Error:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Timely Noodles' });
});

app.get('/menu', (req, res) => {
  res.render('menu', { title: 'Menu - Timely Noodles' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us - Timely Noodles' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us - Timely Noodles' });
});

//products
app.get('/product/:slug', (req, res) => {
  const slug = req.params.slug;
  const productMap = {
    'sesame': {
      name: 'Sesame cold noodles',
      image: '/images/04.jpg',
      price: '$14.99',
      description: 'Our classic chilled noodle with sesame sauce.'
    },
    'chicken': {
      name: 'Sesame chicken cold noodles',
      image: '/images/01.jpg',
      price: '$16.50',
      description: 'Chicken version with sesame sauce and more flavor.'
    },
    'miso-soup': {
      name: 'Miso soup',
      image: '/images/07.jpg',
      price: '$8.99',
      description: 'Traditional Japanese miso soup.'
    },
    'pork-udon': {
      name: 'Pork udon',
      image: '/images/02.jpg',
      price: '$15.99',
      description: 'Hot udon noodles with pork.'
    },
    'chicken-udon': {
      name: 'Chicken udon',
      image: '/images/05.jpg',
      price: '$15.99',
      description: 'Hot udon noodles with chicken.'
    },
    'black-tea': {
      name: 'Black tea',
      image: '/images/06.jpg',
      price: '$4.99',
      description: 'Traditional black tea.'
    }
  };

  const product = productMap[slug];
  if (!product) {
    return res.status(404).render('404', {
      title: '404 Not Found',
      message: 'Product not found',
      url: req.originalUrl
    });
  }

  db.all('SELECT * FROM product_feedback ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      return res.status(500).send("DB read error");
    }

    const filtered = rows.filter(msg => msg.product === product.name);

    const averageRating = filtered.reduce((acc, msg) => acc + (msg.rating || 0), 0) / filtered.length;
    res.render('product', {
      title: `${product.name} - Timely Noodles`,
      product,
      messages: filtered,
      averageRating: averageRating.toFixed(2)  // keep 2 decimal place
    });
  });

});

// POST contact_messages
app.post('/contact', (req, res) => {
  const { firstname, surname, email, phone, message } = req.body;
  const timestamp = new Date().toISOString();

  db.run('INSERT INTO contact_messages (firstname, surname, email, phone, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)', 
    [firstname, surname, email, phone, message, timestamp], 
    function(err) {
    if (err) {
      console.error("DB INSERT ERROR:", err.message);
      return res.status(500).send('Error inserting contact message');
    }

    console.log('Insert successful, lastID:', this.lastID);
    // Redirect to a thank you page instead of rendering directly
    res.redirect('/contact-success');
  });
});

// Add a new route for the success page
app.get('/contact-success', (req, res) => {
  db.get('SELECT * FROM contact_messages ORDER BY timestamp DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error("DB read error:", err.message);
      return res.status(500).send("Error loading message");
    }
    res.render('messages', {
      title: 'Thank You',
      messages: [row],
      name: row ? row.firstname : 'Guest',
      message: row ? row.message : ''
    });
  });
});

// POST product feedback
app.post('/product-feedback', (req, res) => {
  const { firstname, message, product, rating } = req.body;
  const timestamp = new Date().toISOString();

  const sql = `INSERT INTO product_feedback (firstname, message, product, rating, timestamp) 
               VALUES (?, ?, ?, ?, ?)`;
  const params = [firstname, message, product, rating || 0, timestamp];

  db.run(sql, params, function(err) {
    if (err) {
      console.error("DB INSERT ERROR:", err.message);
      return res.status(500).send('Error inserting feedback: ' + err.message);
    }
    console.log('Feedback inserted successfully, ID:', this.lastID);

    //Find the corresponding slug based on the product name
    let productSlug;
    switch (product.toLowerCase()) {
      case 'sesame cold noodles':
        productSlug = 'sesame';
        break;
      case 'sesame chicken cold noodles':
        productSlug = 'chicken';
        break;
      case 'miso soup':
        productSlug = 'miso-soup';
        break;
      case 'pork udon':
        productSlug = 'pork-udon';
        break;
      case 'chicken udon':
        productSlug = 'chicken-udon';
        break;
      case 'black tea':
        productSlug = 'black-tea';
        break;
      default:
        productSlug = 'sesame'; // default value
    }

    res.redirect(`/product/${productSlug}`);
  });
});

//messages
// app.get('/messages', (_req, res) => {
//   console.log('Fetching messages from database...');
//   db.all('SELECT * FROM messages ORDER BY timestamp DESC', (err, rows) => {
//     if (err) {
//       console.error("DB read error:", err.message);
//       return res.status(500).send("Error loading messages");
//     }
//     console.log('Found messages:', rows.length);
//     console.log('First message:', rows[0]);
//     res.render('messages', {
//       title: 'All Messages',
//       messages: rows,
//       name: rows[0] ? rows[0].firstname : 'Guest',
//       message: rows[0] ? rows[0].message : ''
//     });
//   });
// });



//login

app.get('/login', (req, res) => {
  res.render('login', { title: 'Employee Login', error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    req.session.loggedIn = true;
    res.redirect('/admin');

  } else {
    res.render('login', {
      title: 'Employee Login',
      error: 'Invalid username or password'
    });
  }
});

// admin dashboard
app.get('/admin', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }

  db.all('SELECT * FROM contact_messages ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      console.error("DB read error:", err.message);
      return res.status(500).send("Error loading contact messages");
    }

    res.render('admin', {
      title: 'Admin Dashboard',
      contacts: rows
    });
  });
});



//download product feedback
app.get('/export-product-feedback', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }

  db.all('SELECT * FROM product_feedback ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      return res.status(500).send("Error loading feedback");
    }

    const header = Object.keys(rows[0] || {}).join(',') + '\n';
    const body = rows.map(r => Object.values(r).join(',')).join('\n');
    const csv = header + body;

    res.setHeader('Content-disposition', 'attachment; filename=product_feedback.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  });
});

//logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// 404 handling
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 Not Found',
    message: 'Page not found',
    url: req.originalUrl
  });
});

// start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});

