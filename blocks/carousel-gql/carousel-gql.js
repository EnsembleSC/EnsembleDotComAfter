import AdobeAemHeadlessClientJs from 'https://cdn.skypack.dev/pin/@adobe/aem-headless-client-js@v3.2.0-R5xKUKJyh8kNAfej66Zg/mode=imports,min/optimized/@adobe/aem-headless-client-js.js';

import { createOptimizedPicture } from '../../scripts/aem.js';
import { getConfigValue, calcEnvironment } from '../../scripts/configs.js';

async function fetchCarouselData(block) {
  //extract persisted query from block
  let persistedQuery = '';
  const divElements = block.querySelectorAll('div > div');

  divElements.forEach((element, index) => {
    const textContent = element.textContent.trim();
    if (textContent === 'Persisted Query' && index + 1 < divElements.length) {
      const nextElement = divElements[index + 1];
      if (nextElement) {
        persistedQuery = nextElement.textContent.trim();
      }
    }
  });

  console.log('Persisted Query:', persistedQuery);
  block.innerHTML = '';

  try {
    const AEM_HOST = await getConfigValue('aem-host');
    const AEM_GRAPHQL_ENDPOINT = await getConfigValue('aem-graphql-endpoint');
    const AUTH_TOKEN = await getConfigValue('auth');

    console.log('Environment:', calcEnvironment());
    console.log('AEM_HOST:', AEM_HOST);
    console.log('AEM_GRAPHQL_ENDPOINT:', AEM_GRAPHQL_ENDPOINT);
    console.log('AUTH_TOKEN:', AUTH_TOKEN);

    const AEM_HEADLESS_CLIENT = new AdobeAemHeadlessClientJs({
      serviceURL: AEM_HOST,
      auth: AUTH_TOKEN,
    });
    let dataObj = {};

    if (persistedQuery) {
      const endpoint = `${AEM_GRAPHQL_ENDPOINT}${persistedQuery}`;
      console.log('endpoint', endpoint);
      dataObj = await AEM_HEADLESS_CLIENT.runPersistedQuery(endpoint);
    }

    const data = dataObj?.data?.edsWorkshopCarouselList?.items;
    return data;
  } catch (e) {
    console.error('Unexpected error while fetching GraphQL data:', e);
    return [];
  }
}

function groupDataByTitle(data) {
  const groupedData = {};
  data.forEach(item => {
    const groupKey = item.title.toLowerCase().replace(/\s+/g, '-');
    groupedData[groupKey] = item;
  });
  return groupedData;
}

function createCarouselCard(card, key) {
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card', key);
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-wrapper');
  const infoContainer = document.createElement('div');
  infoContainer.classList.add('info-wrapper');

  const title = document.createElement('p');
  title.textContent = card.title;

  const services = document.createElement('p');
  services.textContent = card.services;

  const description = document.createElement('p');
  description.textContent = card.description;

  const image = createOptimizedPicture(card.referenceImage, card.title, true, [
    { width: '210' },
  ]);

  infoContainer.appendChild(title);
  infoContainer.appendChild(services);
  infoContainer.appendChild(description);
  imageContainer.appendChild(image);
  cardContainer.appendChild(imageContainer);
  cardContainer.appendChild(infoContainer);

  return cardContainer;
}

function renderData(groupedData, block) {
  const carouselInner = document.createElement('div');
  carouselInner.classList.add('carousel-container');

  const navContainer = document.createElement('div');
  navContainer.classList.add('carousel-nav');
  const prevButton = document.createElement('button');
  const prevIcon = document.createElement('img');
  prevIcon.src = '/icons/left-arrow.png';
  prevButton.classList.add('left-arrow');
  prevButton.appendChild(prevIcon);

  const nextButton = document.createElement('button');
  const nextIcon = document.createElement('img');
  nextIcon.src = '/icons/right-arrow.png';
  nextButton.classList.add('right-arrow');
  nextButton.appendChild(nextIcon);

  block.appendChild(prevButton);
  block.appendChild(carouselInner);
  block.appendChild(nextButton);
  navContainer.appendChild(prevButton);
  navContainer.appendChild(nextButton);
  block.appendChild(navContainer);

  Object.keys(groupedData).forEach((key, index) => {
    const card = groupedData[key];
    const cardElement = createCarouselCard(card, key);
    let currentIndex = 0;
    if (index >= currentIndex && index < currentIndex + 3) {
      cardElement.classList.add('active');
    }
    carouselInner.appendChild(cardElement);
  });

  let currentIndex = 0;
  const totalItems = Object.keys(groupedData).length;

  function updateActiveCard() {
    const cards = carouselInner.querySelectorAll('.card');
    cards.forEach((card, index) => {
      if (index >= currentIndex && index < currentIndex + 3) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 3 + totalItems) % totalItems;
    updateActiveCard();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 3) % totalItems;
    updateActiveCard();
  });
}

export default async function decorate(block) {
  const data = await fetchCarouselData(block);
  const groupedData = groupDataByTitle(data);
  renderData(groupedData, block);
}
