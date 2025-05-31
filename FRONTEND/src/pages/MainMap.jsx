import MapComp from '../components/map/MapComp';

export default function MainMap() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Mappa interattiva</h1>
      <MapComp />
    </div>
  );
}
