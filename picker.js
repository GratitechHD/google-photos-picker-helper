// picker.js
// Google Photos Library API integration for image picking

const CLIENT_ID = '214215208846-t8tcn7343prse24g6i00c2lqqi6k49ue.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

let accessToken = null;

function showStatus(msg) {
  document.getElementById('status').textContent = msg;
}

// 1. Authenticate and get OAuth token
async function authenticate() {
  return new Promise((resolve, reject) => {
    google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          accessToken = tokenResponse.access_token;
          resolve(accessToken);
        } else {
          reject('Failed to get access token');
        }
      }
    }).requestAccessToken();
  });
}

// 2. Fetch media items from the user's Google Photos library
async function fetchMediaItems(pageToken = null) {
  let url = 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=25';
  if (pageToken) url += `&pageToken=${pageToken}`;
  const response = await fetch(url, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) throw new Error('Failed to fetch media items');
  return response.json();
}

// 3. Render media items as a gallery for picking
function renderGallery(mediaItems) {
  const gallery = document.createElement('div');
  gallery.style.display = 'flex';
  gallery.style.flexWrap = 'wrap';
  gallery.style.gap = '12px';
  gallery.style.marginTop = '1em';

  mediaItems.forEach(item => {
    const img = document.createElement('img');
    img.src = item.baseUrl + '=w200-h200-c';
    img.alt = item.filename || '';
    img.style.width = '120px';
    img.style.height = '120px';
    img.style.objectFit = 'cover';
    img.style.cursor = 'pointer';
    img.title = item.filename || '';
    img.addEventListener('click', () => selectImage(item));
    gallery.appendChild(img);
  });

  // Remove previous gallery if exists
  const prev = document.getElementById('gphotos-gallery');
  if (prev) prev.remove();
  gallery.id = 'gphotos-gallery';
  document.body.appendChild(gallery);
}

// 4. Handle image selection
function selectImage(item) {
  // Send the selected photo back to the opener window
  if (window.opener) {
    window.opener.postMessage({
      type: 'GOOGLE_PHOTOS_SELECTED',
      photos: [item.baseUrl + '=d'] // Use download parameter for full image
    }, '*'); // Replace * with your Amazon origin in production
    showStatus('Photo sent to parent window!');
    setTimeout(() => window.close(), 1000);
  } else {
    showStatus('No opener window found.');
  }
}

// 5. Main flow

document.getElementById('pick').addEventListener('click', async function() {
  showStatus('Authenticating with Google...');
  try {
    await authenticate();
    showStatus('Fetching your Google Photos...');
    const data = await fetchMediaItems();
    if (data.mediaItems && data.mediaItems.length > 0) {
      showStatus('Click a photo to select it.');
      renderGallery(data.mediaItems);
    } else {
      showStatus('No photos found in your Google Photos library.');
    }
  } catch (e) {
    showStatus('Error: ' + e);
  }
}); 