const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./js/userModel');
const morgan = require('morgan');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Route to display job listings
app.get('/job', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const userName = `${user.firstName} ${user.lastName}`;
    res.render('job', { jobs: jsonData, userName: userName });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Profile route
app.get('/profile', isAuthenticated, async (req, res) => {
 try {
   const user = await User.findById(req.session.userId);
   if (!user) {
     return res.status(404).send('User not found');
   }
   const userName = `${user.firstName} ${user.lastName}`; // Kullanıcının adını ve soyadını birleştiriyoruz
   res.render('profile', { user, userName }); // userName değişkenini ekliyoruz
 } catch (err) {
   console.error('Error fetching user profile:', err);
   res.status(500).send('Server error');
 }
});

app.get('/updateprofile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const universities = require('./universities.json');
    const userUniversity = universities.find(u => u.name === user.education.institution);
    const userFaculties = [...(userUniversity?.faculty || []), user.education.faculty].filter(Boolean);
    const userName = `${user.firstName} ${user.lastName}`;

    res.render('updateprofile', { user, userName, universities, userFaculties });
  } catch (err) {
    console.error('Error fetching user profile for update:', err);
    res.status(500).send('Server error');
  }
});

app.post('/updateprofile', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, institution, faculty, status , currentJobCompany, currentJobPosition,profileLink,mentorInterest } = req.body;
    const user = await User.findById(req.session.userId);

    user.firstName = firstName;
    user.lastName = lastName;
    user.education = { institution, faculty, status };
    user.currentJob.company = currentJobCompany;
    user.currentJob.position = currentJobPosition;
    user.profileLink = profileLink;
    user.mentorInterest = mentorInterest === 'on';

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating user profile:', err);
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
     res.status(400).json({ error: `Error signing up user: ${errorMessages}` });
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

app.get('/companies',isAuthenticated, (req, res) => {
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

app.post('/check-existence', async (req, res) => {
  const { type, value } = req.body;
  let exists = false;

  if (type === 'email') {
    exists = await User.exists({ email: value });
  } else if (type === 'username') {
    exists = await User.exists({ username: value });
  }

  res.json({ exists });
});

// Nodemailer yapılandırması
const transporter = nodemailer.createTransport({
  service: 'gmail', // Kullandığınız e-posta hizmeti
  auth: {
    user: 'your-email@gmail.com', // E-posta adresiniz
    pass: 'your-password' // E-posta şifreniz
  }
});

// Şifre sıfırlama rotası
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı');
    }

    // Şifre sıfırlama bağlantısı oluştur
    const resetToken = user.generateResetToken();
    await user.save();

    const resetUrl = `http://localhost:${port}/reset-password/${resetToken}`;

    // Şifre sıfırlama bağlantısını e-posta ile gönder
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Şifre Sıfırlama',
      text: `Şifrenizi sıfırlamak için aşağıdaki bağlantıyı tıklayın: ${resetUrl}`
    };

    await transporter.sendMail(mailOptions);

    res.send('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
  } catch (err) {
    console.error('Hata oluştu:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// Assuming the isAuthenticated middleware and User model are defined earlier in your code
// Assuming the isAuthenticated middleware and User model are defined earlier in your code
app.get('/department', isAuthenticated, async (req, res) => {
  const companyName = req.query.company;
  const deptName = req.query.dept;
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(404).send('User not found');
  }
  const userName = `${user.firstName} ${user.lastName}`;

  try {
    const companies = require('./companies.json');
    const company = companies.find(c => c.name === companyName);

    if (company) {
      const users = await User.find({ 'currentJob.company': companyName, 'currentJob.position': deptName });

      if (users.length > 0) {
        res.render('department', { companyName: company.name, departmentName: deptName, users,userName: userName });
      } else {
        res.render('department', { userName: userName, companyName: company.name, departmentName: deptName, users: [], message: 'No users found in this department.' });
      }
    } else {
      res.status(404).send('Company not found');
    }
  } catch (err) {
    console.error('Error fetching company departments:', err);
    res.status(500).send('Server error');
  }
});

app.get('/faculty', isAuthenticated, async (req, res) => {
  const universityName = req.query.university;
  const facultyName = req.query.faculty;
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(404).send('User not found');
  }
  const userName = `${user.firstName} ${user.lastName}`;

  try {
    const universities = require('./universities.json');
    const university = universities.find(u => u.name === universityName);

    if (university){
      const users = await User.find({'education.institution':universityName,'education.faculty':facultyName});
      if (users.length > 0) {
        res.render('faculty', { universityName: university.name, facultyName: facultyName, users, userName: userName });
      } else {
        res.render('faculty', { userName: userName,universityName: university.name, facultyName: facultyName, users: [], message: 'No users found in this faculty.' });
      }
    }
    else{
      res.status(404).send('University not found');
    }
  }
  catch (err) {
    console.error('Error fetching company faculties:', err);
    res.status(500).send('Server error');
  }
});




app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Geçersiz veya süresi dolmuş bağlantı');
    }

    res.render('reset-password', { token });
  } catch (err) {
    console.error('Hata oluştu:', err);
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Geçersiz veya süresi dolmuş bağlantı');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send('Şifreniz başarıyla sıfırlandı! Giriş yapmak için <a href="/">tıklayın</a>.');
  } catch (err) {
    console.error('Hata oluştu:', err);
    res.status(500).send('Sunucu hatası');
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

