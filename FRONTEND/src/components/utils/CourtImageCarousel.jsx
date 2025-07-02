// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../../context/fetchWithAuth';
import { useAuth } from '../../context/AuthContext';

export default function CourtImageCarousel({ images = [], courtName = '', onUploadSuccess, courtId }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const { accessToken } = useAuth();

  function nextImg() {
    if (!images.length) return;
    setImgIndex((prev) => (prev + 1) % images.length);
  }
  function prevImg() {
    if (!images.length) return;
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length || !courtId) return;
    setUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await fetchWithAuth(
        `${API_URL}/courts/${courtId}/images`,
        {
          method: 'POST',
          body: formData
        },
        { accessToken }
      );
      if (!res.ok) throw new Error('Errore durante il caricamento delle immagini');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      alert('Errore durante il caricamento delle immagini');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function openFileDialog() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  return (
    <div className="carousel relative w-full flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        onClick={openFileDialog}
        disabled={uploading}
        className="absolute top-2 right-2 z-10 py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-normal text-base hover:from-orange-600 hover:to-red-600 transition-colors shadow flex items-center gap-2 disabled:opacity-60 cursor-pointer">
        <FontAwesomeIcon icon={faArrowUpFromBracket} className='mr-2' />
        {uploading ? 'Caricamento...' : 'Carica immagini'}
      </button>
      {images.length > 0 ? (
        <>
          <div className="w-full aspect-[16/9] relative mb-2">
            <img
              src={images[imgIndex].url}
              alt={courtName}
              className="absolute inset-0 w-full h-full object-cover rounded shadow"
            />
            <div className="flex justify-between w-full absolute top-1/2 left-0 px-2 -translate-y-1/2 z-10">
              <button onClick={prevImg} className="bg-white/80 hover:bg-white text-xl rounded-full px-3 py-1 shadow">
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>
              <button onClick={nextImg} className="bg-white/80 hover:bg-white text-xl rounded-full px-3 py-1 shadow">
                <FontAwesomeIcon icon={faAnglesRight} />
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            {imgIndex + 1} / {images.length}
          </div>
        </>
      ) : (
        <div className="w-full aspect-[16/3] flex flex-col items-center justify-center bg-gray-100 rounded shadow mb-2 relative">
          <span className="text-gray-500 mb-4">Non ci sono ancora immagini per questo campetto</span>
        </div>
      )}
    </div>
  );
}
