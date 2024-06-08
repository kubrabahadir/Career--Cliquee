from bs4 import BeautifulSoup
import requests
import json

def get_url(position):
    template = 'https://www.kariyer.net/is-ilanlari/{}'
    url = template.format(position)
    return url

def get_record(card):
    part = card.find('span', class_='k-ad-card-title multiline')
    information = card.get_text()
    title = information.split('    ')[0]
    company = card.find('div', class_='subtitle').find('span').text
    work_model = card.find('span', class_='work-model').text
    job_link ='https://www.kariyer.net/'+card['href']
    try:
        location = card.find('span', class_='location').text
    except AttributeError:
        location=''
    record = (title, company, work_model, location, job_link)
    return record

def write_records(position):
    url = get_url(position)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    cards = soup.find_all('a', 'k-ad-card')

    records = []
    for card in cards:
        record = get_record(card)
        records.append({
            "Title": record[0],
            "Company": record[1],
            "Work Model": record[2],
            "Location": record[3],
            "Job Link": record[4]
        })

        with open('data.json', 'w') as f:
            json.dump(records, f)

    return records

# Kullanım örneği

write_records("yazılım")
