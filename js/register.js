function validateName(name, errorId) {
    if (name.trim() === '') {
      document.getElementById(errorId).textContent = `${errorId.replace('Error', '')} is required`;
      return false;
    }
    document.getElementById(errorId).textContent = '';
    return true;
  }
  
  function validateEmail(email, errorId) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      document.getElementById(errorId).textContent = 'Please enter a valid email address';
      return false;
    }
    document.getElementById(errorId).textContent = '';
    return true;
  }
  
  function validatePassword(password, confirmPassword, errorId, confirmErrorId) {
    if (password.length < 6) {
      document.getElementById(errorId).textContent = 'Password must be at least 6 characters long';
      return false;
    }
    if (password !== confirmPassword) {
      document.getElementById(confirmErrorId).textContent = 'Passwords do not match';
      return false;
    }
    document.getElementById(errorId).textContent = '';
    document.getElementById(confirmErrorId).textContent = '';
    return true;
  }
  
  async function checkExistence(type, value) {
    try {
      const response = await fetch('/check-existence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, value })
      });
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking existence:', error);
      return false;
    }
  }
  
  async function validateForm() {
    const firstNameValid = validateName(firstName.value, 'firstNameError');
    const lastNameValid = validateName(lastName.value, 'lastNameError');
    const emailValid = validateEmail(email.value, 'emailError');
    const passwordValid = validatePassword(password.value, confirmPassword.value, 'passwordError', 'confirmPasswordError');
  
    if (!firstNameValid || !lastNameValid || !emailValid || !passwordValid) {
      return false;
    }
  
    const username = `${firstName.value.toLowerCase()}${lastName.value.toLowerCase()}`;
  
    try {
      const [emailExists, usernameExists] = await Promise.all([
        checkExistence('email', email.value),
        checkExistence('username', username)
      ]);
  
      if (emailExists) {
        document.getElementById('emailError').textContent = 'Email is already registered';
        return false;
      }
  
      if (usernameExists) {
        document.getElementById('lastNameError').textContent = 'Username is already taken';
        return false;
      }
    } catch (error) {
      console.error('Error checking existence:', error);
      document.getElementById('formError').textContent = 'An error occurred. Please try again later.';
      return false;
    }
  
    return true;
  }
  
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');