# Google Photos Picker Helper

This is a helper page for picking photos from Google Photos and sending them to a parent window (e.g., a userscript on Amazon).

## Usage

1. Deploy this directory to GitHub Pages (see below).
2. Open the page in a popup from your userscript or web app.
3. The user clicks the button to pick a photo.
4. The selected photo(s) are sent back to the opener window via `window.postMessage`.

## Deploying to GitHub Pages

1. Create a new public repository on GitHub (e.g., `google-photos-picker-helper`).
2. Push these files to the repository.
3. In the repository settings, enable GitHub Pages (set source to `main` branch and `/ (root)` folder).
4. Your page will be live at `https://YOUR_USERNAME.github.io/google-photos-picker-helper/`.

## Integrating with Your Userscript

- Open the picker page in a popup:
  ```js
  const popup = window.open('https://YOUR_USERNAME.github.io/google-photos-picker-helper/', 'GooglePhotosPicker', 'width=600,height=700');
  ```
- Listen for the message:
  ```js
  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://YOUR_USERNAME.github.io') return;
    if (event.data.type === 'GOOGLE_PHOTOS_SELECTED') {
      const photos = event.data.photos;
      // Handle the photos (download, upload, etc.)
    }
  });
  ```

## Adding Google Photos Picker API

- Replace the placeholder logic in `picker.js` with real Google OAuth and Picker API integration.
- See the [Google Photos Picker API guide](https://developers.google.com/photos/picker/guides/get-started-picker) for details. 