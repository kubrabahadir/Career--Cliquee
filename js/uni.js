document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const uniName = params.get('name');

  fetch('/universities.json')
    .then(response => response.json())
    .then(universities => {
      const university = universities.find(u => u.name === uniName);
      const uniDetails = document.getElementById('uniDetails');

      if (university) {
        uniDetails.innerHTML = `
          <!--<h1>${university.name}</h1>-->
          <!--<p>${university.description}</p>-->
          <div class="box">
            <h3>University Profile</h3>
            <!--<p>${university.profile}</p>-->
          </div>
          <div class="box">
            <h3>Programs</h3>
            <!--<p>${university.programs}</p>-->
          </div>
          <div class="box">
            <h3>Career Resources</h3>
            <!--<p>${university.careerResources}</p>-->
          </div>
          <div class="box">
            <h3>Student Life</h3>
            <!--<p>${university.studentLife}</p>-->
          </div>
        `;

        const boxes = uniDetails.querySelectorAll('.box');
        boxes.forEach(box => {
          box.addEventListener('click', navigateToLobby);
        });
      } else {
        uniDetails.innerHTML = '<p>University not found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching university data:', error);
      const uniDetails = document.getElementById('uniDetails');
      uniDetails.innerHTML = '<p>Error loading university details.</p>';
    });
});

function navigateToLobby() {
  window.location.href = 'lobby.html';
}