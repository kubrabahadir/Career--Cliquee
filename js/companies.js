document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.box a').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const companyName = link.dataset.company;
        const encodedCompanyName = encodeURIComponent(companyName);
        window.location.href = `/company?name=${encodedCompanyName}`;
      });
    });
  });
