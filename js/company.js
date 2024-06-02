document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const companyName = urlParams.get('name');

  fetch('/companies.json')
    .then(response => response.json())
    .then(companies => {
      const company = companies.find(c => c.name === companyName);
      if (company) {
        const companyDetails = document.getElementById('companyDetails');
        companyDetails.innerHTML = `
          ${company.departments.map(dept => `
            <div class="box" style="text-decoration: none; color: white">
              <a href="#" class="department-link" data-company="${company.name}" data-dept="${dept}" style="text-decoration: none; color: white"><p>${dept}</p></a>
            </div>
          `).join('')}
        `;

        document.querySelectorAll('.department-link').forEach(link => {
          link.addEventListener('click', event => {
            event.preventDefault();
            const linkElement = event.target.closest('a');
            const companyName = linkElement.getAttribute('data-company');
            const deptName = linkElement.getAttribute('data-dept');
            fetch(`/department?company=${companyName}&dept=${deptName}`)
              .then(response => response.text())
              .then(html => {
                const departmentDetails = document.getElementById('departmentDetails');
                if (departmentDetails) {
                  departmentDetails.innerHTML = html;
                } else {
                  document.body.innerHTML = html;
                }
              })
              .catch(error => {
                console.error('Error fetching department details:', error);
                companyDetails.innerHTML = '<p>Error loading department details.</p>';
              });
          });
        });
      } else {
        const companyDetails = document.getElementById('companyDetails');
        companyDetails.innerHTML = '<p>Company not found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const companyDetails = document.getElementById('companyDetails');
      companyDetails.innerHTML = '<p>Error loading company details.</p>';
    });
});
