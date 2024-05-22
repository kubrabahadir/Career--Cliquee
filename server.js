const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
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
        res.sendFile(path.join(__dirname, 'home.html')); // Başarılı giriş, home.html sayfasına yönlendir
      } else {
        // Şifre yanlışsa JavaScript ile uyarı kutusu göster
        res.send('<script>alert("Wrong Password"); window.location.href="/";</script>');
      }
    } else {
      // Kullanıcı bulunamadıysa JavaScript ile uyarı kutusu göster
      res.send('<script>alert("User Not Found"); window.location.href="/";</script>');
    }
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).send('Error logging in user');
  }
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
