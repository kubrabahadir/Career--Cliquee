// Ensure that your main server file (e.g., server.js) looks like this:

const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./js/userModel');
const morgan = require('morgan');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 5502;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname));

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/myapp' })
}));

// Authentication middleware function
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/');
  }
}

// Profile route
app.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('profile', { user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send('Server error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/signup',
  body('firstName').isLength({ min: 1 }).trim().escape(),
  body('lastName').isLength({ min: 1 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 5 }).trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      const user = new User({ firstName, lastName, email, password, username });
      await user.save();
      res.redirect('/');
    } catch (err) {
      console.error('Error signing up user:', err);
      const errorMessages = Object.values(err.errors).map(e => e.message).join(', ');
      res.status(500).send(`Error signing up user: ${errorMessages}`);
    }
  });

app.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 5 }).trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        if (user.password === password) {
          req.session.userId = user._id;
          req.session.userName = `${user.firstName} ${user.lastName}`;
          res.render('home', { userName: req.session.userName });
        } else {
          res.send('<script>alert("Wrong Password"); window.location.href="/";</script>');
        }
      } else {
        res.send('<script>alert("User Not Found"); window.location.href="/";</script>');
      }
    } catch (err) {
      console.error('Error logging in user:', err);
      res.status(500).send('Error logging in user');
    }
  });

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out user:', err);
      return res.status(500).send('Error logging out user');
    }
    res.redirect('/');
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.get('/home', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    // home.ejs dosyasını render et
    res.render('home', { userName: req.session.userName });
  } catch (err) {
    console.error('Error rendering home page:', err);
    res.status(500).send('Server error');
  }
});

app.get('/companies', isAuthenticated, (req, res) => {
  res.render('companies', { userName: req.session.userName });
});

app.get('/company', isAuthenticated, (req, res) => {
  res.render('company', { userName: req.session.userName });
});


app.get('/uni', isAuthenticated, (req, res) => {
  res.render('uni', { userName: req.session.userName });
});

app.get('/universities', isAuthenticated, (req, res) => {
  res.render('universities', { userName: req.session.userName });
});

app.get('/university', isAuthenticated, (req, res) => {
  const universityName = req.query.name;
  res.render('university', { userName: req.session.userName, universityName });
});


app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı port üzerinde çalışıyor.`);
  exec(`start http://localhost:${port}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Hata oluştu: ${error}`);
      return;
    }
    console.log(stdout);
  });
});
