import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComp() {
  return (
    <MapContainer center={[45.4642, 9.19]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[45.4642, 9.19]}>
        <Popup>
          Qui c'è un marker!
        </Popup>
      </Marker>
    </MapContainer>
  );
}