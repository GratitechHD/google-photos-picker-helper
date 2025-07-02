// picker.js
// Placeholder for Google Photos Picker integration
// You will need to fill in the real OAuth and Picker API logic

const CLIENT_ID = '214215208846-t8tcn7343prse24g6i00c2lqqi6k49ue.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/photospicker.readonly';

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

// 2. Create Picker session
async function createPickerSession() {
  const response = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mediaTypes: ['PHOTOS'],
    })
  });
  if (!response.ok) throw new Error('Failed to create picker session');
  return response.json();
}

// 3. Poll for selection
async function pollSession(sessionId) {
  let done = false;
  let pollUrl = `https://photospicker.googleapis.com/v1/sessions/${sessionId}`;
  while (!done) {
    const response = await fetch(pollUrl, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    const data = await response.json();
    if (data.mediaItemsSet) {
      done = true;
      return data;
    }
    // Wait for the recommended interval (default: 2s)
    await new Promise(res => setTimeout(res, 2000));
  }
}

// 4. List selected media items
async function listMediaItems(sessionId) {
  const response = await fetch(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) throw new Error('Failed to list media items');
  return response.json();
}

// 5. Main flow

document.getElementById('pick').addEventListener('click', async function() {
  showStatus('Authenticating with Google...');
  try {
    await authenticate();
    showStatus('Creating Google Photos Picker session...');
    const session = await createPickerSession();
    const pickerUri = session.pickerUri;
    showStatus('Opening Google Photos Picker...');
    window.open(pickerUri, '_blank');

    showStatus('Waiting for selection...');
    const sessionData = await pollSession(session.sessionId);

    showStatus('Retrieving selected photos...');
    const items = await listMediaItems(session.sessionId);

    // Send the selected photo(s) back to the opener window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_PHOTOS_SELECTED',
        photos: items.mediaItems.map(item => item.baseUrl)
      }, '*'); // Replace * with your Amazon origin in production
      showStatus('Photo(s) sent to parent window!');
      setTimeout(() => window.close(), 1000);
    } else {
      showStatus('No opener window found.');
    }
  } catch (e) {
    showStatus('Error: ' + e);
  }
}); 