import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { faCalendar } from '@fortawesome/free-regular-svg-icons'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'

export default function ProfileHeaderComp({ profile, onChangeAvatar }) {
  const avatarUrl = profile?.avatar || '/vite.svg'

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
          <button
            onClick={onChangeAvatar}
            className="
              absolute bottom-2 right-2
              bg-white border border-gray-300 rounded-full
              p-1 w-8 h-8
              shadow hover:bg-gray-100 transition
              md:bottom-0 md:right-0 md:p-2 md:w-11 md:h-11
            "
            title="Cambia avatar"
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
          </button>
        </div>
        {/* Info utente */}
        <div className="flex flex-col items-center md:items-start flex-1">
          <div className="text-4xl font-bold text-white-500 mb-2">
            {profile?.username || 'Username'}
          </div>
          <div className="text-white-600 text-sm mt-1 flex gap-4 items-center">
            <span className="flex items-center mr-3">
              <FontAwesomeIcon icon={faCalendar} className="mr-2 font-thin" />
              <span className="font-thin text-lg">{profile?.age || '--'}</span>
            </span>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faLocationDot} className="mr-2 font-thin" />
              <span className="font-thin text-lg">{profile?.city || 'Città'}</span>
            </span>
          </div>
        </div>
        {/* Bottone modifica profilo */}
        <button
          className="w-auto mt-4 md:mt-0 md:mr-5 bg-white text-orange-600 font-semibold px-5 py-2 rounded-md shadow hover:bg-gray-100 transition">
            <FontAwesomeIcon icon={faGear} className='mr-3' />
          Modifica profilo
        </button>
      </div>
    </>
  )
}
