document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.box a').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const universityName = link.dataset.university;
        const encodedUniversityName = encodeURIComponent(universityName);
        window.location.href = `university?name=${encodedUniversityName}`;
      });
    });
  });
  