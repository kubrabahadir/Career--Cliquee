const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 5502;

// POST verilerini işlemek için body-parser middleware'ini kullan
app.use(bodyParser.urlencoded({ extended: true }));

// Statik dosyaları sunmak için public klasörünü kullan
app.use(express.static(path.join(__dirname, 'deneme')));

// Admin sayfasını sunmak için route oluştur

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

// Admin girişi için route oluştur
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Kullanıcı adı ve şifre kontrolü burada yapılabilir
    // Örneğin:
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

const cors = require('cors');

// CORS middleware'ini kullan
app.use(cors());