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

import FloatingLabel from './FloatingLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSave, faMapMarkerAlt, faLocationCrosshairs, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

export default function AddCourtForm({
  form,
  handleChange,
  handleSubmit,
  handleImagesChange,
  removeImage,
  searchCoordinates,
  addressCoordinates,
  previewImages,
  loading,
  searchingCoordinates,
  useManualCoordinates,
  manualCoordinates,
  handleManualCoordinatesChange,
  toggleCoordinateMode
}) {
  return (
    <div className="bg-white rounded-lg shadow-xl border-orange-500 border-l-4 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <h2 className="text-2xl md:text-3xl font-bold">AGGIUNGI UN NUOVO CAMPETTO</h2>
        <p className="text-lg opacity-90 mt-1">Inserisci i dati del campetto per aggiungerlo alla mappa</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="!mb-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FloatingLabel 
                id="name" 
                type="text" 
                label="Nome del campetto *" 
                value={form.name}
                onChange={handleChange} />
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2 items-start">
                <div className="flex-grow">
                  <FloatingLabel 
                    id="address" 
                    type="text" 
                    label="Indirizzo completo *" 
                    value={form.address}
                    onChange={handleChange} />
                  <p className="text-xs text-gray-500 mt-1">
                    Inserisci: Via/Piazza, numero civico, CAP, città (es. Via Roma 25, 20123 Milano)
                  </p>
                </div>

                {!useManualCoordinates && (
                  <button 
                    type="button"
                    onClick={searchCoordinates}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition cursor-pointer"
                    disabled={searchingCoordinates || !form.address}
                    title="Cerca coordinate dall'indirizzo">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={searchingCoordinates ? 'animate-pulse' : ''} />
                  </button>
                )}
              </div>

              {/* Toggle per modalità coordinate */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <FontAwesomeIcon icon={faLocationCrosshairs} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Inserire coordinate manualmente?
                </span>
                <button
                  type="button"
                  onClick={toggleCoordinateMode}
                  className={`
                    p-1 rounded transition-all duration-300 transform hover:scale-110
                    ${useManualCoordinates ? 'text-orange-600' : 'text-gray-400'}
                  `}
                  title={useManualCoordinates ? 'Passa alla ricerca per indirizzo' : 'Inserisci coordinate manualmente'}>
                  <FontAwesomeIcon 
                    icon={useManualCoordinates ? faToggleOn : faToggleOff} 
                    className="text-2xl transition-all duration-300" 
                  />
                </button>
                <span className={`
                  text-xs transition-all duration-300
                  ${useManualCoordinates ? 'text-blue-600 font-medium' : 'text-gray-500'}
                `}>
                  {useManualCoordinates ? 'Coordinate manuali attive' : 'Ricerca per indirizzo attiva'}
                </span>
              </div>

              {/* Campi coordinate manuali */}
              <div className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${useManualCoordinates ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className={`
                  grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg
                  transform transition-all duration-500 ease-in-out
                  ${useManualCoordinates ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
                `}>
                  <div>
                    <FloatingLabel 
                      id="latitude" 
                      type="number" 
                      step="any"
                      label="Latitudine *" 
                      value={manualCoordinates.latitude}
                      onChange={handleManualCoordinatesChange} 
                      placeholder="es. 45.4642"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Valore tra -90 e 90
                    </p>
                  </div>
                  <div>
                    <FloatingLabel 
                      id="longitude" 
                      type="number" 
                      step="any"
                      label="Longitudine *" 
                      value={manualCoordinates.longitude}
                      onChange={handleManualCoordinatesChange} 
                      placeholder="es. 9.1900"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Valore tra -180 e 180
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="bg-blue-100 border border-blue-300 rounded-md p-3 text-sm">
                      <p className="font-medium text-blue-800 mb-1">💡 Come trovare le coordinate:</p>
                      <ul className="text-blue-700 space-y-1 text-xs">
                        <li>• Apri Google Maps e cerca il luogo</li>
                        <li>• Clicca con il tasto destro sul punto esatto</li>
                        <li>• Clicca sul primo numero nel menu (le coordinate)</li>
                        <li>• Copia i valori: il primo è latitudine, il secondo longitudine</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visualizzazione coordinate trovate */}
          <div className={`
            overflow-hidden transition-all duration-500 ease-in-out
            ${(addressCoordinates || (useManualCoordinates && manualCoordinates.latitude && manualCoordinates.longitude)) ? 
              'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className={`
              bg-green-50 border border-green-200 rounded-md p-3 text-sm
              transform transition-all duration-500 ease-in-out
              ${(addressCoordinates || (useManualCoordinates && manualCoordinates.latitude && manualCoordinates.longitude)) ? 
                'translate-y-0 scale-100' : 'translate-y-2 scale-95'}
            `}>
              <p className="font-medium text-green-800">✓ Coordinate {useManualCoordinates ? 'inserite' : 'trovate'}:</p>
              <p className="text-green-600">
                {useManualCoordinates ? (
                  `Lat: ${manualCoordinates.latitude}, Lon: ${manualCoordinates.longitude}`
                ) : (
                  addressCoordinates && `Lat: ${addressCoordinates.coordinates[1]}, Lon: ${addressCoordinates.coordinates[0]}`
                )}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FloatingLabel 
              id="baskets" 
              type="number" 
              label="Numero di canestri *" 
              value={form.baskets}
              onChange={handleChange} />
            
            <div className="flex items-center space-x-2">
              <input
                id="officialsize"
                type="checkbox"
                checked={form.officialsize}
                onChange={handleChange}
                className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
              <label htmlFor="officialsize" className="text-gray-700">
                Dimensioni ufficiali
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="nightlights"
                type="checkbox"
                checked={form.nightlights}
                onChange={handleChange}
                className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
              <label htmlFor="nightlights" className="text-gray-700">
                Illuminazione notturna
              </label>
            </div>
          </div>
            <div className="mt-6">
            <p className="text-gray-700 mb-2">Foto del campetto (opzionale)</p>
            <div className="flex flex-wrap gap-4 mb-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Preview ${index+1}`} 
                    className="h-24 w-24 object-cover rounded-md"/>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
              
              <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <FontAwesomeIcon icon={faUpload} className="text-gray-400 text-xl mb-1" />
                <span className="text-xs text-gray-500">Aggiungi foto</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                />              </label>
            </div>
            <p className="text-xs text-gray-500">
              Puoi caricare fino a 10 immagini del campetto (opzionale). Formati supportati: JPG, PNG.
            </p>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || !addressCoordinates}
              className={`
                flex items-center px-6 py-3 rounded-lg font-medium 
                ${loading || !addressCoordinates ? 
                  'bg-gray-300 cursor-not-allowed text-gray-500' : 
                  'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                }
                transition duration-200 cursor-pointer
              `}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {loading ? 'Creazione in corso...' : 'Crea campetto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
