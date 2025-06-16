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

import { useState } from 'react';
import basketballImage from '../../assets/basketball-svg.png';

/**
 * Componente che gestisce le immagini con fallback automatico
 * @param {string} src - URL dell'immagine da caricare
 * @param {string} alt - Testo alternativo per l'immagine
 * @param {Object} props - Altri props da passare all'elemento img
 * @returns {JSX.Element} - Elemento img con gestione del fallback
 */
export default function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false);
  
  // Usa l'immagine di fallback se c'è un errore o se src è undefined/null
  const imageSrc = (!src || error) ? basketballImage : src;
  
  return (
    <img
      src={imageSrc}
      alt={alt || 'Immagine'}
      onError={() => setError(true)}
      {...props}
    />
  );
}
