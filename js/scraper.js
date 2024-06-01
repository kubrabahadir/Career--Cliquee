const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://example.com/jobs'; // Çekmek istediğiniz iş ilanlarının URL'si

const scrapeJobs = async () => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jobs = [];

    $('.job-listing').each((index, element) => {
      const title = $(element).find('.job-title').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const location = $(element).find('.job-location').text().trim();
      const description = $(element).find('.job-description').text().trim();

      jobs.push({ title, company, location, description });
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return [];
  }
};

module.exports = scrapeJobs;
