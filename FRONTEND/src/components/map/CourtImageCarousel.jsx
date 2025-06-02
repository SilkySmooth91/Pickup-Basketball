import { useState } from 'react';

export default function CourtImageCarousel({ images = [], courtName = '', onUploadClick }) {
  const [imgIndex, setImgIndex] = useState(0);

  function nextImg() {
    if (!images.length) return;
    setImgIndex((prev) => (prev + 1) % images.length);
  }
  function prevImg() {
    if (!images.length) return;
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  if (!images.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 rounded shadow mb-2">
        <span className="text-gray-500 mb-4">Non ci sono ancora immagini per questo campetto</span>
        <button
          onClick={onUploadClick}
          className="px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-colors"
        >Carica immagini</button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md flex flex-col items-center">
      <img
        src={images[imgIndex].url}
        alt={courtName}
        className="w-full h-64 object-cover rounded shadow mb-2"
      />
      <div className="flex justify-between w-full absolute top-1/2 left-0 px-2 -translate-y-1/2">
        <button onClick={prevImg} className="bg-white/80 hover:bg-white text-xl rounded-full px-3 py-1 shadow">&#8592;</button>
        <button onClick={nextImg} className="bg-white/80 hover:bg-white text-xl rounded-full px-3 py-1 shadow">&#8594;</button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        {imgIndex + 1} / {images.length}
      </div>
    </div>
  );
}
