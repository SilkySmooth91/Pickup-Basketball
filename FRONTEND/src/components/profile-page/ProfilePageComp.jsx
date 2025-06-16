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

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile, updateUserAvatar } from '../../api/userApi'
import { Navigate } from 'react-router-dom'
import ProfileHeaderComp from './ProfileHeaderComp'
import InfoCardComp from './InfoCardComp'
import RecentActivityComp from './RecentActivityComp'
import CommentsSection from '../utils/CommentsSection'
import PageContainer from '../utils/PageContainer'
import LoadingSpinner from '../utils/LoadingSpinner'


export default function ProfilePageComp({ userId }) {
  const { accessToken, refresh, logout, user, loading, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!loading) {
      const fetchProfile = async () => {
        try {
          // Usa l'ID utente passato come prop, altrimenti usa l'ID dell'utente autenticato
          const profileId = userId || user?.id;
          if (!profileId) {
            setError("ID utente non valido");
            return;
          }
          const data = await getUserProfile(profileId, { accessToken, refresh, logout });
          setProfile(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchProfile();
    }
  }, [loading, user, userId, accessToken, refresh, logout])

  // Centralizza qui il calcolo
  const isOwner = user && profile && String(user.id) === String(profile._id);
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Se non autenticato, redirect alla home
    return <Navigate to="/" replace />;
  }
  if (error) return <div className="text-red-500">{error}</div>
  if (!profile) return <LoadingSpinner />

  // Handler per cambio avatar
  const handleChangeAvatar = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  // Upload avatar
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await updateUserAvatar(user.id, file, { accessToken, refresh, logout });
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
      setUser((prev) => ({ ...prev, avatar: data.avatar }));
      localStorage.setItem("user", JSON.stringify({ ...user, avatar: data.avatar }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageContainer>
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
      <RecentActivityComp userId={profile._id} />
      <CommentsSection targetId={profile._id} targetType="Users" />
    </PageContainer>
  )
}
