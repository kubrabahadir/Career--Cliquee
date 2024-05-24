const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./js/userModel');
const app = express();
const port = 5502;

// Statik dosyaları servis etmek için
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Express-session yapılandırması
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/myapp' })
}));

// Rotalar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      if (user.password === password) {
        req.session.userId = user._id;  // Kullanıcıyı oturuma kaydet
        res.sendFile(path.join(__dirname, 'home.html')); // Başarılı giriş, home.html sayfasına yönlendir
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