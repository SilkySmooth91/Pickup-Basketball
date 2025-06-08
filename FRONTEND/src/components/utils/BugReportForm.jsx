import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import FloatingLabel from './FloatingLabel';
import { toast } from 'react-toastify';

export default function BugReportForm() {
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setBugReport(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleBugSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
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
    
    // Qui inserire la logica per inviare i dati a un endpoint backend
    try {
      // Simulazione di una richiesta API
      // In un caso reale, sostituire con una vera chiamata API:
      // fetch(`${import.meta.env.VITE_API_URL}/api/bug-reports`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`  // Se serve autenticazione
      //   },
      //   body: JSON.stringify(bugReport)
      // })
      // .then(response => {
      //   if (!response.ok) throw new Error('Errore durante l'invio del report');
      //   return response.json();
      // })
      
      // Simulazione del comportamento asincrono
      setTimeout(() => {
        toast.success("Grazie per la tua segnalazione!");
        setIsLoading(false);
        setIsSubmitted(true);
        setBugReport({ title: '', description: '', email: '' });
      }, 1000);
      
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
            value={bugReport.email}
            onChange={handleInputChange}/>
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isLoading || !bugReport.title || !bugReport.description || !bugReport.email}
              className={`flex items-center px-5 py-2 rounded-md text-white transition-colors ${
                isLoading || !bugReport.title || !bugReport.description
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
