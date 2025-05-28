import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'

export default function ProfileHeaderComp({ profile, onChangeAvatar }) {

  const avatarUrl = profile?.avatar || '/vite.svg'

  return (
    <div className='container md mx-auto px-4 py-8'>
        <div className="flex items-center gap-6 mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl rounded-lg">
          <div className="relative p-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow"
            />
            <button
              onClick={onChangeAvatar}
              className="absolute bottom-3 right-2 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition"
              title="Cambia avatar"
            >
              <FontAwesomeIcon icon={faPen} className="w-5 h-5 text-red-400" />
            </button>
          </div>
          <div>
            <div className="text-2xl font-bold text-white-500">{profile?.username || 'Username'}</div>
            <div className="text-white-600 text-sm mt-1">
              <span className="mr-3">Età: <span className="font-semibold">{profile?.age || '--'}</span></span>
              <span>Città: <span className="font-semibold">{profile?.city || 'Città'}</span></span>
            </div>
          </div>
        </div>
    </div>
  )
}
