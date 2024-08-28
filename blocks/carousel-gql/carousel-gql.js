import { createOptimizedPicture } from '../../scripts/aem.js';

async function fetchCarouselData(block) {
  const link = block.querySelector('a');
  let data = [];
  const response = await fetch(link?.href);
  if (response.ok) {
    const jsonData = await response.json();

    // grab nested array from the response
    data = jsonData.data.edsWorkshopCarouselList.items;
  } else {
    // eslint-disable-next-line no-console
    console.log('Failed to fetch carousel data');
  }

  // remove element after fetching data
  link?.remove();
  return data;
}

function groupDataByTitle(data) {
  const groupedData = {};
  data.forEach((item) => {
    // use the title as the group key
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

  // only append image if imageUrl exists
  const image = createOptimizedPicture(card.referenceImage, card.title, true, [
    { width: '210' },
  ]);

  // append elements to the containers
  infoContainer.appendChild(title);
  infoContainer.appendChild(services);
  infoContainer.appendChild(description);
  imageContainer.appendChild(image);
  cardContainer.appendChild(imageContainer);
  cardContainer.appendChild(infoContainer);

  return cardContainer;
}

function renderData(groupedData, block) {
  // create carousel container for the items
  const carouselInner = document.createElement('div');
  carouselInner.classList.add('carousel-container');

  // create carousel navigation container & buttons
  const navContainer = document.createElement('div');
  navContainer.classList.add('carousel-nav');
  const prevButton = document.createElement('button');
  const prevIcon = document.createElement('img');
  prevIcon.src = '/icons/left-arrow.png';
  prevButton.classList.add('left-arrow');
  prevButton.appendChild(prevIcon);

  const nextButton = document.createElement('button');
  const nextIcon = document.createElement('img');
  nextButton.classList.add('right-arrow');
  nextIcon.src = '/icons/right-arrow.png';
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

    // set active class for the first item
    if (index === 0) {
      cardElement.classList.add('active');
    }

    carouselInner.appendChild(cardElement);
  });

  // add event listeners for navigation buttons
  let currentIndex = 0;
  const totalItems = Object.keys(groupedData).length;

  function updateActiveCard() {
    const cards = carouselInner.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === currentIndex);
    });
  }

  prevButton.addEventListener('click', () => {
    currentIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    updateActiveCard();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
    updateActiveCard();
  });
}

export default async function decorate(block) {
  const data = await fetchCarouselData(block);
  const groupedData = groupDataByTitle(data);
  renderData(groupedData, block);
}

// import { fetchPersistedQuery } from '../../api/persistedQueries.js';

// export default async function decorate() {
//   const persistedQuery = 'EDS-Workshop/results';
//   const queryParameters = {};

//   try {
//     const { data, error } = await fetchPersistedQuery(
//       persistedQuery,
//       queryParameters
//     );

//     if (error) {
//       console.error('Failed to fetch GraphQL data:', error);
//     } else {
//       console.log('GraphQL response data:', data);
//     }
//   } catch (e) {
//     console.error('Unexpected error while fetching GraphQL data:', e);
//   }
// }