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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCourt } from '../api/courtApi';
import HeaderComp from '../components/utils/HeaderComp';
import Footer from '../components/utils/Footer';
import AddCourtForm from '../components/utils/AddCourtForm';
import SEOHelmet from '../components/utils/SEOHelmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function AddCourtPage() {  
  const navigate = useNavigate();
  const { accessToken, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [addressCoordinates, setAddressCoordinates] = useState(null);
  const [searchingCoordinates, setSearchingCoordinates] = useState(false);
  const [useManualCoordinates, setUseManualCoordinates] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  const [form, setForm] = useState({
    name: '',
    address: '',
    baskets: 2,
    officialsize: false,
    nightlights: false,
  });


  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleManualCoordinatesChange = (e) => {
    const { id, value } = e.target;
    setManualCoordinates(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const toggleCoordinateMode = () => {
    setUseManualCoordinates(!useManualCoordinates);
    // Reset coordinate quando si cambia modalità
    setAddressCoordinates(null);
    setManualCoordinates({ latitude: '', longitude: '' });
  };

  const handleImagesChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previewsArray]);
    }
  };

  const removeImage = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);

    const newPreviewImages = [...previewImages];
    URL.revokeObjectURL(newPreviewImages[index]); // Libera memoria
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };
  const searchCoordinates = async () => {
    if (!form.address) {
      toast.error("Inserisci un indirizzo per cercare le coordinate");
      return;
    }

    setSearchingCoordinates(true);

    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?` + 
        `format=json&q=${encodeURIComponent(form.address)}&` +
        `addressdetails=1&limit=1&polygon_geojson=0&countrycodes=it`;
      
      const res = await fetch(searchUrl);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          setAddressCoordinates({
            type: "Point",
            coordinates: [lon, lat] // GeoJSON usa [longitude, latitude]
          });
          toast.success("Coordinate trovate con successo!");
        } else {
          toast.error("Impossibile ottenere coordinate valide per questo indirizzo");
        }
      } else {
        toast.error("Indirizzo non trovato. Prova a essere più specifico");
      }
    } catch (error) {
      console.error("Errore nella geocodifica:", error);
      toast.error("Errore durante la ricerca delle coordinate");
    } finally {
      setSearchingCoordinates(false);
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!form.name || !form.address) {
      toast.error("Nome e indirizzo sono obbligatori");
      return;
    }

    // Validazione coordinate
    let finalCoordinates;
    if (useManualCoordinates) {
      const lat = parseFloat(manualCoordinates.latitude);
      const lon = parseFloat(manualCoordinates.longitude);
      
      if (!manualCoordinates.latitude || !manualCoordinates.longitude) {
        toast.error("Inserisci sia latitudine che longitudine");
        return;
      }
      
      if (isNaN(lat) || isNaN(lon)) {
        toast.error("Le coordinate devono essere numeri validi");
        return;
      }
      
      if (lat < -90 || lat > 90) {
        toast.error("La latitudine deve essere tra -90 e 90");
        return;
      }
      
      if (lon < -180 || lon > 180) {
        toast.error("La longitudine deve essere tra -180 e 180");
        return;
      }
      
      finalCoordinates = {
        type: "Point",
        coordinates: [lon, lat] // GeoJSON usa [longitude, latitude]
      };
    } else {
      if (!addressCoordinates) {
        toast.error("Cerca le coordinate dell'indirizzo prima di salvare");
        return;
      }
      finalCoordinates = addressCoordinates;
    }

    setLoading(true);

    try {      
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('coordinates', JSON.stringify(finalCoordinates));
      formData.append('baskets', form.baskets);
      formData.append('officialsize', form.officialsize.toString());
      formData.append('nightlights', form.nightlights.toString());
      
      // Aggiungi immagini se presenti
      if (selectedImages.length > 0) {
        selectedImages.forEach(image => {
          formData.append('images', image);
        });
      }
      
      await createCourt(formData, { 
        accessToken,
        refresh 
      });
      
      toast.success("Campetto creato con successo!");
      
      setForm({
        name: '',
        address: '',
        baskets: 2,
        officialsize: false,
        nightlights: false,
      });
      setSelectedImages([]);
      setPreviewImages([]);
      setAddressCoordinates(null);
      setManualCoordinates({ latitude: '', longitude: '' });
      setUseManualCoordinates(false);
      
      // Redirect alla mappa dopo alcuni secondi
      setTimeout(() => {
        navigate('/map');
      }, 2000);    } catch (error) {
      console.error("Errore nella creazione del campetto:", error);
      toast.error(error.message || "Errore durante la creazione del campetto");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <>
      <SEOHelmet
        title="Aggiungi un nuovo campo da basket"
        description="Contribuisci alla community aggiungendo un nuovo campo da basket. Condividi la posizione, le caratteristiche e le foto del campo."
        url="/add-court"
        keywords="aggiungi campo basket, nuovo campo basket, contribuisci community, condividi campo basket"
        noIndex={true}
      />
      <div className="min-h-screen flex flex-col bg-gray-100">
        <HeaderComp />
        <div className="container mx-auto px-4 py-8 flex-grow">
        <button 
          onClick={() => navigate('/map')}
          className="mb-4 flex items-center gap-2 py-2 px-4 rounded-md shadow bg-white hover:bg-gray-100 text-orange-600 hover:text-orange-700 transition-colors font-medium cursor-pointer">
          <FontAwesomeIcon icon={faArrowLeft} />
          Torna alla mappa
        </button>
      
        <div className="w-full max-w-4xl mx-auto">
          <AddCourtForm 
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleImagesChange={handleImagesChange}
            removeImage={removeImage}
            searchCoordinates={searchCoordinates}
            addressCoordinates={addressCoordinates}
            previewImages={previewImages}
            loading={loading}
            searchingCoordinates={searchingCoordinates}
            useManualCoordinates={useManualCoordinates}
            manualCoordinates={manualCoordinates}
            handleManualCoordinatesChange={handleManualCoordinatesChange}
            toggleCoordinateMode={toggleCoordinateMode}
          />
        </div>
      </div>
      
      <Footer />
    </div>
    </>
  );
}
