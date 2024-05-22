const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 5503;
const cors = require('cors');

// POST verilerini işlemek için body-parser middleware'ini kullan
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // JSON verilerini işlemek için

// Statik dosyaları sunmak için public klasörünü kullan
app.use(express.static(path.join(__dirname, 'deneme')));
app.use(express.static(path.join(__dirname, '..', 'styles')));

// CORS middleware'ini kullan
app.use(cors());

// Admin sayfasını sunmak için route oluştur
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin girişi için route oluştur
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Kullanıcı adı ve şifre kontrolü
    if (username === 'admin' && password === '12345') {
        res.send('Admin girişi başarılı!');
    } else {
        res.status(401).send('Kullanıcı adı veya şifre hatalı!');
    }
});

// Sunucuyu dinlemeye başla
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

const methodOverride = require('method-override');

// method-override middleware'ini kullan
app.use(methodOverride('_method'));