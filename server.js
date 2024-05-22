const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const port = 5502; // veya kullanmak istediğiniz başka bir port numarası

// Statik dosyaları servis etmek için
app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı port üzerinde çalışıyor.`);
    
    // Tarayıcıyı otomatik olarak aç
    exec(`start http://localhost:${port}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Hata oluştu: ${error}`);
            return;
        }
        console.log(stdout);
    });
});