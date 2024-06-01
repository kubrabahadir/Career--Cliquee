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
            <a href="/department?company=${company.name}&dept=${encodeURIComponent(dept)}" style="text-decoration: none; color: white"><p>${dept}</p></a>
          </div>
        `).join('')}
      `;
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
