import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const AUTH_TOKEN = '33365759-bdd854990cd5a8ba018a7d8b1';
const PER_PAGE = 40;

const form = document.querySelector('#search-form');
const input = form.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';
let currentPage = 1;
let initialPage = currentPage;

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function fetchPhotos(query) {
  return await axios.get(BASE_URL, {
    params: {
      key: AUTH_TOKEN,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: PER_PAGE,
      page: currentPage,
    },
  });
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const query = input.value;

  currentPage = initialPage;

  if (!input.value) {
    Notiflix.Notify.warning('Please enter your request in the input field');
    return;
  }
  try {
    const response = await fetchPhotos(query);

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
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, something went wrong. Please try again later.'
    );
  }
}

async function handleLoadMore() {
  currentPage += 1;

  const query = input.value;
  try {
    const response = await fetchPhotos(query);
    const photos = response.data.hits;
    if (
      response.data.hits.length === 0 ||
      currentPage * PER_PAGE >= response.data.totalHits
    ) {
      loadMoreBtn.style.display = 'none';
      renderPhotos(photos);
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    renderPhotos(photos);

    loadMoreBtn.style.display = 'block';
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
}

function renderPhotos(photos) {
  photos.forEach(photo => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    photoCard.innerHTML = `<a href="${photo.largeImageURL}" class="photo-link"><img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" /> </a> <div class="info"> <p class="info-item"> <b>Likes:</b> ${photo.likes} </p> <p class="info-item"> <b>Views:</b> ${photo.views} </p> <p class="info-item"> <b>Comments:</b> ${photo.comments} </p> <p class="info-item"> <b>Downloads:</b> ${photo.downloads} </p> </div> `;
    gallery.appendChild(photoCard);
  });

  const lightbox = new SimpleLightbox('.photo-link');
  lightbox.refresh();
}
