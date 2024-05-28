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
        <style>
        #departmentsBox a {
            text-decoration: none;
            color:#fff;
        }
         </style>
         <div class="container">
         <p>${company.name}</p>
         <img src="${company.logo}" alt="Company Logo">
         <p>${company.profile}</p>
         <p>${company.internships}</p>
         <p>${company.careerTips}</p>
         <p>${company.learningResources}</p>
     </div>
     
     <div class="box" id="departmentsBox">
         <h3><a href="/departments?name=${companyName}">Departments</a></h3>
     </div>
     
     <div class="box" id="joinNowBox">
         <h3>Join Now</h3>
     </div>
     
        `;

        document.getElementById('joinNowBox').addEventListener('click', () => navigateToPage('lobby.html', companyName));
        
        function navigateToPage(page, companyName) {
            window.location.href = `/${page}?name=${companyName}`;
        }

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

function navigateToPage(page) {
  window.location.href = page;
}

function navigateToHomepage() {
  window.location.href = 'lobby.html';
}
