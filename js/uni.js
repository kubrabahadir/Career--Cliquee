document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const universityName = urlParams.get('name');

  fetch('/universities.json')
    .then(response => response.json())
    .then(universities => {
      const university = universities.find(u => u.name === universityName);
      if (university) {
        const uniDetails = document.getElementById('uniDetails');
        uniDetails.innerHTML = `
          ${university.faculty.map(dept => `
            <div class="box" style="text-decoration: none; color: white">
              <a href="#" class="faculty-link" data-university="${university.name}" data-faculty="${dept}" style="text-decoration: none; color: white"><p>${dept}</p></a>
            </div>
          `).join('')}
        `;

        document.querySelectorAll('.faculty-link').forEach(link => {
          link.addEventListener('click', event => {
            event.preventDefault();
            const linkElement = event.target.closest('a');
            const universityName = linkElement.getAttribute('data-university');
            const facultyName = linkElement.getAttribute('data-faculty');
            fetch(`/faculty?university=${universityName}&faculty=${facultyName}`)
              .then(response => response.text())
              .then(html => {
                const facultyContainer = document.getElementById('facultyContainer');
                if (facultyContainer) {
                  facultyContainer.innerHTML = html;
                } else {
                  document.body.innerHTML = html;
                }
              })
              .catch(error => {
                console.error('Error fetching faculty details:', error);
                facultyContainer.innerHTML = '<p>Error loading faculty details.</p>';
              });
          });
        });
      } else {
        const uniDetails = document.getElementById('uniDetails');
        uniDetails.innerHTML = '<p>University not found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const uniDetails = document.getElementById('uniDetails');
      uniDetails.innerHTML = '<p>Error loading university details.</p>';
    });
});
