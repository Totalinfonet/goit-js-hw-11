import axios from 'axios';
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
const AUTH_TOKEN = '33365759-bdd854990cd5a8ba018a7d8b1';

const form = document.querySelector('#search-form');
const input = form.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.style.display = 'none';

let currentPage = 1;

form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();

  const query = input.value;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: AUTH_TOKEN,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage,
      },
    });
    console.log('🚀 ~ file: index.js:34 ~ onFormSubmit ~ response', response);

    const photos = response.data.hits;

    if (photos.length === 0) {
      loadMoreBtn.style.display = 'none';
      gallery.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      gallery.innerHTML = '';
      renderPhotos(photos);
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, something went wrong. Please try again later.'
    );
  }
}

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  const query = input.value;
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: AUTH_TOKEN,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage,
      },
    });
    if (
      response.data.hits.length === 0 ||
      currentPage * 40 >= response.data.totalHits
    ) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    const photos = response.data.hits;
    renderPhotos(photos);

    loadMoreBtn.style.display = 'block';
    currentPage++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      Notiflix.Notify.failure(
        'Sorry, something went wrong. Please try again later.'
      );
    }
    loadMoreBtn.style.display = 'none';
  }
});

function renderPhotos(photos) {
  photos.forEach(photo => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');
    photoCard.innerHTML = `<img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" /> <div class="info"> <p class="info-item"> <b>Likes:</b> ${photo.likes} </p> <p class="info-item"> <b>Views:</b> ${photo.views} </p> <p class="info-item"> <b>Comments:</b> ${photo.comments} </p> <p class="info-item"> <b>Downloads:</b> ${photo.downloads} </p> </div> `;
    gallery.appendChild(photoCard);
  });
}
