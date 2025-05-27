import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../api/userApi'

export default function ProfilePageComp() {
  const { accessToken, refresh, logout, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user?.id, { accessToken, refresh, logout });
        setProfile(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (user?.id) fetchProfile();
  }, [user, accessToken, refresh, logout])

  if (error) return <div className="text-red-500">{error}</div>
  if (!profile) return <div>Caricamento profilo...</div>

  return (
    <div>
      <h2>Profilo utente</h2>
      <div>Nome: {profile.username}</div>
      <div>Email: {profile.email}</div>
      <div>Città: {profile.city}</div>
      <div>Età: {profile.age}</div>
      {/* altri dati */}
    </div>
  )
}
