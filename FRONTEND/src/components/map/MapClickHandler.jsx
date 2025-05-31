import { useMapEvent } from 'react-leaflet';

export default function MapClickHandler({ onMapClick }) {
  useMapEvent('click', (e) => {
    const { lat, lng } = e.latlng;
    onMapClick([lat, lng]);
  });
  return null;
}
