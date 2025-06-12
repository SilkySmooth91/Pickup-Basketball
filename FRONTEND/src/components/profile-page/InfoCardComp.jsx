import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FriendsModalComp from './FriendsModalComp';
import LoadingSpinner from '../../components/utils/LoadingSpinner';
import FloatingLabel from '../utils/FloatingLabel';

export default function InfoCardComp({ profile, isOwner }) {
  const [showModal, setShowModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [form, setForm] = useState({ old: '', pwd: '', repeat: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { accessToken } = useAuth();
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    // Validazioni
    if (form.pwd !== form.repeat) {
      setError('Le password non coincidono');
      toast.error('Le password non coincidono');
      return;
    }
    
    if (form.old === form.pwd) {
      setError('La nuova password deve essere diversa dalla vecchia');
      toast.error('La nuova password deve essere diversa dalla vecchia');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ 
          oldPassword: form.old, 
          newPassword: form.pwd 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il cambio password');      }
      
      // Se arriviamo qui, tutto è andato bene
      toast.success('Password aggiornata con successo!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
        setShowModal(false);
      setForm({ old: '', pwd: '', repeat: '' });
    } catch (err) {
      // Gestione silenziosa dell'errore
      setError(err.message);
      toast.error(err.message || 'Si è verificato un errore durante il cambio password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full mb-8">
      {/* Card principale */}
      <div className="w-full md:w-3/4 bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6">
        <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4">
          <FontAwesomeIcon icon={faEnvelope} className="text-xl text-orange-500 pl-2" />
          <span className="font-semibold text-2xl mb-4 p-4 pl-3">Informazioni</span>
        </div>
        <div className="p-6">
          {/* Email e azioni solo per il proprietario */}
          {isOwner ? (
            <div className="flex flex-col md:flex-row md:items-center justify-start mb-4 pb-4 border-b border-gray-200">
              <div>
                <span className="font-semibold text-gray-600 ">Email: </span>
                <span className="text-gray-700">{profile?.email || "email@email.com"}</span>
              </div>
              <button type="button" onClick={() => setShowModal(true)} className="w-auto mt-2 md:mt-0 md:ml-4 px-3 py-2 font-semibold bg-orange-500 text-white rounded hover:bg-orange-600 transition text-sm">
                Cambia password
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 mt-2">
            <div>
              <span className="font-semibold text-gray-600">Altezza: </span>
              <span className="text-gray-800">{profile?.height || "185 cm"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Ruolo: </span>
              <span className="text-white bg-orange-600 py-1 px-2 rounded-2xl text-center font-semibold">{profile?.basketrole || "Playmaker"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Migliore caratteristica: </span>
              <span className="text-orange-500">{profile?.bestskill || "Velocità"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonna delle due card piccole */}
      <div className="flex flex-row md:flex-col gap-4 w-full md:w-1/4">
        {/* Card eventi */}        <div className="flex-1 flex flex-col items-center bg-white rounded-lg shadow-xl p-4 min-w-[120px] border-orange-500 border border-l-6">
          <FontAwesomeIcon icon={faTrophy} className="text-orange-500 text-3xl mb-2" />
          <div className="text-3xl font-bold text-black">{profile?.userEvents?.length ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Partecipazioni a eventi</div>
        </div>
        {/* Card amici */}
        <div 
          className="flex-1 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center min-w-[120px] border-orange-500 border border-l-6 cursor-pointer hover:bg-orange-50 transition"
          onClick={() => setShowFriendsModal(true)}
        >
          <FontAwesomeIcon icon={faUserGroup} className="text-orange-500 text-3xl mb-2" />
          <div className="text-3xl font-bold text-black">{profile?.friendsCount ?? 0}</div>
          <div className="text-gray-600 text-base mt-1 text-center">Amici</div>
        </div>
      </div>      
      {/* MODALE CAMBIO PASSWORD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 sm:w-11/12 md:w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)} aria-label="Chiudi">×</button>
            <h2 className="text-xl font-bold mb-4 text-orange-600">Cambia password</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatingLabel 
                id="old-password" 
                type="password" 
                label="Vecchia password"
                value={form.old}
                onChange={e => setForm(f => ({ ...f, old: e.target.value }))}
              />
              <FloatingLabel 
                id="new-password" 
                type="password" 
                label="Nuova password"
                value={form.pwd}
                onChange={e => setForm(f => ({ ...f, pwd: e.target.value }))}
              />
              <FloatingLabel 
                id="confirm-password" 
                type="password" 
                label="Conferma nuova password"
                value={form.repeat}
                onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button type="submit" className="bg-orange-500 text-white font-semibold px-4 py-2 rounded hover:bg-orange-600 transition mt-2" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                    <span>Salvataggio...</span>
                  </div>
                ) : "Salva"}
              </button>
            </form>
          </div>
        </div>
      )}      {/* MODALE AMICI */}
      <FriendsModalComp isOpen={showFriendsModal} onClose={() => setShowFriendsModal(false)} isOwner={isOwner} profileId={profile._id} />
      
      {/* ToastContainer locale per assicurarsi che i toast siano visibili */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
