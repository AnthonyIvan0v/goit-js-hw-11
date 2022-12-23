import './sass/index.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';



const refs = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  loadMoreButton: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

refs.loadMoreButton.style.display = 'none';



const imageGallery = ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
  return `
    <div class="photo-card">
        <a href="${largeImageURL}" class="gallery-link">
         <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
         <p class="info-item">
             <b>Likes</b>${likes}
         </p>
         <p class="info-item">
             <b>Views</b>${views}
         </p>
            <p class="info-item">
            <b>Comments</b>${comments}
         </p>
         <p class="info-item">
            <b>Downloads</b>${downloads}
         </p>
        </div>
        </a>
    </div>`;
};

const URL = 'https://pixabay.com/api';
const KEY = '32301803-749fcba2dc9dfacf5342593a6';
axios.defaults.baseURL = URL;

const fetchImages = async input => {
  const queryParams = new URLSearchParams({
    key: KEY,
    q: input,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: variables.limit,
    page: variables.page,
  });

  const { data } = await axios.get('?' + queryParams.toString());
  return data;
};
const variables = {
  page: 1,
  limit: 15,
  totalPages: null,
};


const onGallery = arr => {
  const markup = arr.map(image => imageGallery(image)).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  let lightbox = new SimpleLightbox('.photo-card a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
};

const validate = async () => {
  try {
    const res = await fetchImages(refs.input.value);
    variables.totalPages = Math.ceil(res.totalHits / variables.limit);

    if (res.hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    if (variables.page >= variables.totalPages) {
      refs.loadMoreButton.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.");
    }

    if (variables.page === 1 && res.hits.length > 0) {
      refs.loadMoreButton.style.display = 'block';
      Notify.success(`Hoorey! We found ${res.totalHits} images`);
    }

    onGallery(res.hits);
  } catch (err) {
    Notify.failure(err);
  }
};

const searchImages = event => {
  event.preventDefault();
  refs.gallery.innerHTML = '';
  refs.loadMoreButton.style.display = 'none';
  variables.page = 1;

  validate();
};

const loadMore = () => {
  variables.page += 1;

  validate();
};

refs.form.addEventListener('submit', searchImages);
refs.loadMoreButton.addEventListener('click', loadMore);
