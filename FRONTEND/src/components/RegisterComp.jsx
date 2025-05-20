import React from 'react'
import FloatingLabel from './FloatingLabel'

export default function RegisterComp({ isVisible, onBack, className }) {
  return (
    <div className={`flex justify-center absolute left-0 right-0 top-75 sm:top-1/2 sm:-translate-y-1/2 mx-auto max-w-md transition-all duration-1000 ease-in-out transform z-10 ${
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
    } ${className}`}>
      <form className="space-y-4 px-2 sm:px-0">
        <div className="flex gap-4">
          <FloatingLabel
            id="nome-giocatore"
            type="text"
            label="Nome Giocatore"
            className="flex-1"
          />
          <FloatingLabel
            id="email"
            type="email"
            label="Email"
            className="flex-1"
          />
        </div>
        <div className="flex gap-4">
          <FloatingLabel
            id="password"
            type="password"
            label="Password"
            className="flex-1"
          />
          <FloatingLabel
            id="confirm-password"
            type="password"
            label="Conferma Password"
            className="flex-1"
          />
        </div>
        <div className="flex gap-4 mb-0">
          <FloatingLabel
            id="area-giocatore"
            type="text"
            label="La città dove giochi"
            className="flex-1"
          />
          <FloatingLabel
            id="età-giocatore"
            type="text"
            label="La tua età"
            className="flex-1"
          />
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-4'>
            Registrati
          </button>
          <div className='flex justify-start items-center mt-1 gap-2'>
            <p className='text-sm text-white ps-4'>oppure</p>
            <button 
              type='button'
              onClick={(e) => {
                e.preventDefault()
                onBack()
              }}
              className='transition duration-500 text-red-300 hover:text-red-500'
            >
              Torna al login
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
