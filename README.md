# CHROME Memecoin Website

A React + Vite website with a Chrome Hearts aesthetic for the CHROME memecoin.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Move your images to the `public` folder:
   ```bash
   # Copy Main Image folder to public
   xcopy "Main Image" "public\Main Image" /E /I
   
   # Copy Images folder to public (if you have gallery images)
   xcopy "Images" "public\Images" /E /I
   ```
   
   Or manually move:
   - `Main Image` folder → `public/Main Image`
   - `Images` folder → `public/Images` (if you have gallery images there)
   
   **Note:** The main image uses `download.jpg` from the Main Image folder. Update `src/App.jsx` if you want to use a different image.

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- **Chrome Aesthetic**: Y2K-inspired chrome borders with animated shine effects
- **Main Image Display**: Centered image with 3D chrome frame border
- **Image Gallery**: Grid of images with matching chrome borders
- **Action Buttons**: Three chrome-styled buttons for pump.fun, Twitter, and Chart

## Customization

- Update button links in `src/App.jsx`
- Adjust gallery images in the `galleryImages` array
- Modify chrome effects in `src/App.css`

