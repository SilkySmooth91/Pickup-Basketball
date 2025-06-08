import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faUserPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faCalendar } from '@fortawesome/free-regular-svg-icons'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from '../../components/utils/LoadingSpinner';

export default function ProfileHeaderComp({ profile, isOwner, onChangeAvatar, onProfileUpdate }) {
  const avatarUrl = profile?.avatar || '/vite.svg'
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    age: profile?.age || '',
    city: profile?.city || '',
    height: profile?.height || '',
    basketrole: profile?.basketrole || '',
    bestskill: profile?.bestskill || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [friendReqSent, setFriendReqSent] = useState(false)
  const { accessToken, user } = useAuth(); // <-- fix: aggiungi user

  // Aggiorna i campi del form
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // Salva le modifiche
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${profile._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error("Errore nell'aggiornamento profilo")
      const updated = await res.json()
      setShowModal(false)
      if (onProfileUpdate) onProfileUpdate({ ...profile, ...updated })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Aggiorna i dati del form se cambia il profilo
  useEffect(() => {
    setForm({
      age: profile?.age || '',
      city: profile?.city || '',
      height: profile?.height || '',
      basketrole: profile?.basketrole || '',
      bestskill: profile?.bestskill || ''
    })
  }, [profile])
  // Logica invio richiesta amicizia
  const handleAddFriend = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/friends/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({ to: profile._id })
        }
      );
      if (res.ok) setFriendReqSent(true);
    } catch (err) {
      // Gestisci eventuali errori
    }
  };

  // Determina se sono già amici
  const isFriend = profile?.friends?.some(f => f._id === user?.id) || false;

  return (
    <>
      <div className="
        flex flex-col md:flex-row
        items-center
        gap-y-4 md:gap-y-0 md:gap-x-6
        mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl rounded-lg
        p-6
      ">
        {/* Avatar + pulsante */}
        <div className="relative mb-2 md:mb-0">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-red-200 shadow"
          />
          {isOwner && (
            <button
              onClick={onChangeAvatar}
              className="
                absolute bottom-2 right-2
                bg-white border border-gray-300 rounded-full
                p-1 w-8 h-8
                shadow hover:bg-gray-100 transition
                md:bottom-0 md:right-0 md:p-2 md:w-11 md:h-11
              "
              title="Cambia avatar">
              <FontAwesomeIcon icon={faPen} className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
            </button>
          )}
        </div>
        {/* Info utente */}
        <div className="flex flex-col items-center md:items-start flex-1">
          <div className="text-4xl font-bold text-white-500 mb-2">
            {profile?.username || 'Username'}
          </div>
          <div className="text-white-600 text-sm mt-1 flex gap-4 items-center">
            <span className="flex items-center mr-3">
              <FontAwesomeIcon icon={faCalendar} className="mr-2 font-thin" />
              <span className="font-extralight text-lg">{profile?.age || '--'}</span>
            </span>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faLocationDot} className="mr-2 font-thin" />
              <span className="font-extralight text-lg">{profile?.city || 'Città'}</span>
            </span>
          </div>
        </div>
        {/* Bottone modifica profilo o aggiungi amico */}
        {isOwner ? (
          <button
            className="cursor-pointer w-auto mt-4 md:mt-0 md:mr-5 bg-white text-orange-600 font-semibold px-5 py-2 rounded-md shadow hover:bg-gray-100 transition"
            onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faGear} className='mr-3' />
            Modifica profilo
          </button>
        ) : isFriend ? (
          <button
            className="w-auto mt-4 md:mt-0 md:mr-5 bg-green-100 text-green-800 font-semibold border border-green-700 px-5 py-2 rounded-md shadow cursor-default"
            disabled>
            <FontAwesomeIcon icon={faCheck} className='mr-3' />
            Siete amici
          </button>
        ) : (
          <button
            className="cursor-pointer w-auto mt-4 md:mt-0 md:mr-5 bg-white text-orange-600 font-semibold px-5 py-2 rounded-md shadow hover:bg-gray-100 transition"
            onClick={handleAddFriend}
            disabled={friendReqSent}>
            <FontAwesomeIcon icon={faUserPlus} className='mr-3' />
            {friendReqSent ? "Richiesta inviata" : "Aggiungi amico"}
          </button>
        )}
      </div>

      {/* MODALE */}
      {showModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Chiudi"
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-orange-600">Modifica profilo</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col">
                Età
                <input
                  type="number"
                  name="age"
                  min={13}
                  value={form.age}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 mt-1"
                  required
                />
              </label>
              <label className="flex flex-col">
                Città
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 mt-1"
                  required
                />
              </label>
              <label className="flex flex-col">
                Altezza
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    name="height"
                    min={100}
                    max={250}
                    value={form.height}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-24"
                  />
                  <span className="text-gray-500">cm</span>
                </div>
              </label>
              <label className="flex flex-col">
                Ruolo
                <select
                  name="basketrole"
                  value={form.basketrole}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 mt-1"
                  required
                >
                  <option value="">Seleziona ruolo</option>
                  <option value="Playmaker">Playmaker</option>
                  <option value="Guard">Guard</option>
                  <option value="Forward">Forward</option>
                  <option value="Center">Center</option>
                </select>
              </label>
              <label className="flex flex-col">
                Migliore caratteristica
                <input
                  type="text"
                  name="bestskill"
                  value={form.bestskill}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>              {error && <div className="text-red-500">{error}</div>}
              <button
                type="submit"
                className="bg-orange-500 text-white font-semibold px-4 py-2 rounded hover:bg-orange-600 transition"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    Salvataggio...
                  </>
                ) : "Salva modifiche"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
