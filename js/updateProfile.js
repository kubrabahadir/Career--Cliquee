document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('currentJobCompany');

    fetch('companies.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(company => {
                const option = document.createElement('option');
                option.value = company.name;
                option.textContent = company.name;
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching the companies:', error));
});
