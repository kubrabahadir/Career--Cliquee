document.addEventListener('DOMContentLoaded', () => {
    const userName = '<%= userName %>'; // Server-side rendered user name
    document.getElementById('profile-button').textContent = userName;
    
    document.getElementById('logo').addEventListener('click', () => {
      window.location.href = '/login';
    });
  });

  // home.js
