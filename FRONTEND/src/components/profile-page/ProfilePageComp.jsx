import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile, updateUserAvatar } from '../../api/userApi'
import { Navigate } from 'react-router-dom'
import ProfileHeaderComp from './ProfileHeaderComp'
import InfoCardComp from './InfoCardComp'
import RecentActivityComp from './RecentActivityComp'


export default function ProfilePageComp() {
  const { accessToken, refresh, logout, user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!loading && user?.id) {
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile(user.id, { accessToken, refresh, logout });
          setProfile(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchProfile();
    }
  }, [loading, user, accessToken, refresh, logout])

  // Centralizza qui il calcolo
  const isOwner = user && profile && String(user.id) === String(profile._id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <span className="text-gray-700">Caricamento profilo...</span>
      </div>
    );
  }

  if (!user) {
    // Se non autenticato, redirect alla home
    return <Navigate to="/" replace />;
  }

  if (error) return <div className="text-red-500">{error}</div>
  if (!profile) return <div>Caricamento profilo...</div>

  // Handler per cambio avatar
  const handleChangeAvatar = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  // Upload avatar
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await updateUserAvatar(user.id, file, { accessToken, refresh, logout })
      setProfile((prev) => ({ ...prev, avatar: data.avatar }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeaderComp
        profile={profile}
        isOwner={isOwner}
        onChangeAvatar={handleChangeAvatar}
        onProfileUpdate={setProfile}
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
      />
      <InfoCardComp profile={profile} isOwner={isOwner} />
      <RecentActivityComp userId={user.id} />
    </div>
  )
}
