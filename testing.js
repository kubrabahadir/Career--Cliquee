const firebaseConfig = {
    apiKey: "AIzaSyDbRHsscoIn_MHz3q9dS3St-MynPWbw6ls",
    authDomain: "thesis-career-cliquee.firebaseapp.com",
    projectId: "thesis-career-cliquee",
    storageBucket: "thesis-career-cliquee.appspot.com",
    messagingSenderId: "605410191328",
    appId: "1:605410191328:web:c23aa6801ff94182e76d85"
  };
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.realtime().ref(); // Değişiklik yapıldı

  document.getElementById("submit").addEventListener('click', function(e) {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const userType = document.getElementById("userType").value;

    // Veritabanına eklemeden önce şifreleri kontrol edelim
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Kullanıcı verilerini Firebase veritabanına ekle
    db.child('users/' + firstName).set({ // Değişiklik yapıldı
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      'confirm-password': confirmPassword,
      userType: userType
    }).then(() => {
      alert("Registration successful!");
      // Kayıt işlemi başarılı olduğunda yapılacak diğer işlemler buraya eklenebilir
    }).catch((error) => {
      console.error("Error adding user: ", error);
      alert("An error occurred. Please try again later.");
    });
  });