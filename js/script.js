// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';
const fetchBtn = document.getElementById('fetch-images-btn');
const startDate = document.getElementById('start-date-input');
const endDateInput = document.getElementById('end-date-input');
const imageContainer = document.getElementById('gallery');

fetchBtn.addEventListener('click', () => {
  const startDateValue = startDate.value;
  const endDateValue = endDateInput.value;

  console.log('Start date:', startDateValue);
  console.log('End date:', endDateValue);

  // Clear previous images
  imageContainer.innerHTML = '';

  fetch(apodData)
    .then(response => response.json())
    .then(data => {
      console.log('Total items fetched:', data.length);
      console.log('Sample dates from data:', data.slice(0, 5).map(item => item.date));

      // Filter data based on the selected date range
      const filteredData = data.filter(item => {
        // If no dates selected, show all
        if (!startDateValue || !endDateValue) {
          return true;
        }

        const itemDate = new Date(item.date);
        const startDateObj = new Date(startDateValue);
        const endDateObj = new Date(endDateValue);
        
        return itemDate >= startDateObj && itemDate <= endDateObj;
      });
      
      console.log('Filtered items:', filteredData.length);

      // Show message if no results
      if (filteredData.length === 0) {
        imageContainer.innerHTML = '<p class="placeholder">No images found for the selected date range.</p>';
        return;
      }

      // Display images
      filteredData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');

        if (item.media_type === 'image') {
          galleryItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}" class="gallery-img">
          `;
        } else if (item.media_type === 'video') {
          galleryItem.innerHTML = `
            <div style="position: relative; display: block;" class="gallery-img">
              <img src="${item.thumbnail_url || item.url}" alt="${item.title}">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">▶</div>
            </div>
          `;
        }

        imageContainer.appendChild(galleryItem);

        // Add click event ONLY to the image
        const imgElement = galleryItem.querySelector('.gallery-img');
        imgElement.style.cursor = 'pointer';
        imgElement.addEventListener('click', () => openModal(item));
      });
    })
    .catch(error => {
      console.error('Error fetching APOD data:', error);
      imageContainer.innerHTML = '<p class="placeholder">Error loading images. Please try again.</p>';
    });
});

// Modal functionality
function openModal(item) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('apod-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'apod-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  // Create modal content
  let modalContent = '';
  if (item.media_type === 'image') {
    modalContent = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img src="${item.hdurl || item.url}" alt="${item.title}">
        <div class="modal-info">
          <h2>${item.title}</h2>
          <p class="modal-date">${item.date}</p>
          <p class="modal-explanation">${item.explanation}</p>
          ${item.copyright ? `<p class="modal-copyright">© ${item.copyright}</p>` : ''}
        </div>
      </div>
    `;
  } else if (item.media_type === 'video') {
    modalContent = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <iframe src="${item.url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        <div class="modal-info">
          <h2>${item.title}</h2>
          <p class="modal-date">${item.date}</p>
          <p class="modal-explanation">${item.explanation}</p>
        </div>
      </div>
    `;
  }

  modal.innerHTML = modalContent;
  modal.style.display = 'flex';

  // Close modal functionality
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.onclick = () => closeModal();
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
}

function closeModal() {
  const modal = document.getElementById('apod-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});