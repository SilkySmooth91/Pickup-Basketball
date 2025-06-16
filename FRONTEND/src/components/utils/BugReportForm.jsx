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

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import FloatingLabel from './FloatingLabel';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { sendBugReport } from '../../api/bugReportApi';
import ReCAPTCHA from 'react-google-recaptcha';

// Chiave del sito reCAPTCHA dalle variabili d'ambiente
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function BugReportForm() {
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, accessToken } = useAuth();
  const recaptchaRef = useRef(null);
  
  // Controlla se il dispositivo è mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      setIsMobile(mobileQuery.matches);
    };
    
    // Controlla subito
    checkIfMobile();
    
    // Controlla al ridimensionamento della finestra
    const mediaQueryList = window.matchMedia('(max-width: 767px)');
    mediaQueryList.addEventListener('change', checkIfMobile);
    
    // Pulizia
    return () => {
      mediaQueryList.removeEventListener('change', checkIfMobile);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setBugReport(prev => ({
      ...prev,
      [id]: value
    }));
  };
    const handleBugSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Verifica che l'utente sia autenticato
    if (!user || !accessToken) {
      toast.error("Devi essere autenticato per inviare una segnalazione");
      setIsLoading(false);
      return;
    }
    
    // Validazione dei campi
    if (!bugReport.title.trim()) {
      toast.error("Inserisci un titolo per la segnalazione");
      setIsLoading(false);
      return;
    }
    
    if (!bugReport.description.trim()) {
      toast.error("Inserisci una descrizione del problema");
      setIsLoading(false);
      return;
    }
    
    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bugReport.email.trim())) {
      toast.error("Inserisci un indirizzo email valido");
      setIsLoading(false);
      return;
    }
    
    try {
      // Verifica che il reCAPTCHA sia stato completato
      let recaptchaToken = null;
      if (recaptchaRef.current) {
        const recaptchaValue = recaptchaRef.current.getValue();
        if (!recaptchaValue) {
          toast.error("Per favore, completa la verifica reCAPTCHA");
          setIsLoading(false);
          return;
        }
        recaptchaToken = recaptchaValue;
      }
      
      // Prepara i dati per l'invio
      const bugReportData = {
        title: bugReport.title.trim(),
        description: bugReport.description.trim(),
        email: bugReport.email.trim(),
        userId: user.id,
        userName: user.username
      };
      
      // Invia la segnalazione includendo il token reCAPTCHA
      await sendBugReport(bugReportData, accessToken, recaptchaToken);
      
      toast.success("Grazie per la tua segnalazione!");
      setIsLoading(false);
      setIsSubmitted(true);
      setBugReport({ title: '', description: '', email: '' });
    } catch (error) {
      toast.error(error.message || "Si è verificato un errore durante l'invio della segnalazione");
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-orange-100">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
          <FontAwesomeIcon icon={faBug} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Segnala un bug</h3>
      </div>
      
      {isSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <p className="text-green-700 font-medium mb-2">Grazie per la tua segnalazione!</p>
          <p className="text-green-600">Il tuo feedback è importante per migliorare l'applicazione.</p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="mt-3 text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-md text-sm px-5 py-2 transition-colors">
            Invia un'altra segnalazione
          </button>
        </div>
      ) : !user ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700 font-medium mb-2">Devi essere autenticato</p>
          <p className="text-yellow-600">Per inviare una segnalazione devi prima effettuare l'accesso.</p>
        </div>
      ) : (
        <form onSubmit={handleBugSubmit} className="!mb-2">
          <p className="text-gray-600 mb-1">Hai riscontrato un problema? Aiutaci a migliorare l'app descrivendolo qui sotto.</p>
          
          <FloatingLabel
            id="title"
            type="text"
            label="Titolo del problema"
            value={bugReport.title}
            onChange={handleInputChange}/>
          
          <FloatingLabel
            id="description"
            label="Descrivi dettagliatamente il problema"
            value={bugReport.description}
            onChange={handleInputChange}
            asTextarea
            rows={4}/>
          
          <FloatingLabel
            id="email"
            type="email"
            label="La tua email"
            value={bugReport.email || (user?.email || '')}
            onChange={handleInputChange}/>
            <div className="text-xs text-gray-500 mt-1 mb-3">
            La segnalazione includerà il tuo nome utente.
          </div>            
          {/* reCAPTCHA checkbox */}
          {RECAPTCHA_SITE_KEY && (
            <div className="mb-3" 
                 style={{ 
                   transform: isMobile ? 'scale(0.8)' : 'none', 
                   transformOrigin: 'left top' 
                 }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
              />
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isLoading || !bugReport.title || !bugReport.description || !bugReport.email}
              className={`flex items-center px-5 py-2 rounded-md text-white transition-colors ${
                isLoading || !bugReport.title || !bugReport.description || !bugReport.email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}>
              {isLoading ? 'Invio in corso...' : 'Invia segnalazione'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
