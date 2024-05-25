document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const companyName = params.get('name');
  
    fetch('/companies.json')
      .then(response => response.json())
      .then(companies => {
        const company = companies.find(c => c.name === companyName);
        const companyDetails = document.getElementById('companyDetails');
  
        if (company) {
          companyDetails.innerHTML = `
            <!--<h1>${company.name}</h1>-->
            <!--<p>${company.description}</p>-->
            <div class="box">
              <h3>Company Profile</h3>
              <!--<p>${company.profile}</p>-->
            </div>
            <div class="box">
              <h3>Products</h3>
              <!--<p>${company.products}</p>-->
            </div>
            <div class="box">
              <h3>Career Opportunities</h3>
              <!--<p>${company.careerOpportunities}</p>-->
            </div>
            <div class="box">
              <h3>Work Culture</h3>
              <!--<p>${company.workCulture}</p>-->
            </div>
          `;
  
          const boxes = companyDetails.querySelectorAll('.box');
          boxes.forEach(box => {
            box.addEventListener('click', navigateToHomepage);
          });
        } else {
          companyDetails.innerHTML = '<p>Company not found.</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching company data:', error);
        const companyDetails = document.getElementById('companyDetails');
        companyDetails.innerHTML = '<p>Error loading company details.</p>';
      });
  });
  
  function navigateToHomepage() {
    window.location.href = 'lobby.html';
  }
  