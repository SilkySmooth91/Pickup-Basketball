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
