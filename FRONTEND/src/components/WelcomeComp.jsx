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

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import '/src/styles/WelcomeComp.css'
import SignInComp from './auth/SignInComp'
import RegisterComp from './auth/RegisterComp'
import ForgotPasswordComp from './auth/ForgotPasswordComp'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import logoImage from '../assets/newLogo.jpg'

export default function WelcomeComp() {
  const [isTitleMoved, setIsTitleMoved] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [searchParams] = useSearchParams()
  
  // Controlla se l'URL contiene parametri specifici all'avvio
  useEffect(() => {
    // Verifica se l'URL contiene un parametro google=fail (autenticazione Google fallita)
    if (searchParams.get('google') === 'fail') {
      // Utilizza setTimeout per assicurarsi che il toast venga mostrato dopo il rendering iniziale
      setTimeout(() => {
        toast.error('L\'autenticazione con Google non è andata a buon fine. Riprova.')
      }, 300)
    }
  }, [searchParams])
  
  return (
    <div className='h-screen w-full flex flex-col justify-center items-center bg-[url(https://res.cloudinary.com/dyg6giw5q/image/upload/v1749401570/market-square-the-pass_xbyjvl.jpg)] bg-bg-local bg-cover bg-center bg-fixed'>        
      <div className={`mx-2 transition-all duration-800 ease-in-out ${
          isTitleMoved 
            ? 'transform -translate-y-[2vh] sm:-translate-y-[10vh] md:-translate-y-[2vh]' 
            : ''
        }`}>
          <div className="flex justify-center items-center">            
            <img 
              src={logoImage} 
              alt="Pickup Basketball Logo" 
              className="w-auto max-w-[350px] md:max-w-[400px] h-auto"
            />
          </div>
        </div>          
        <div className={`relative w-full transition-all duration-800 ease-in-out overflow-hidden ${
          isTitleMoved 
            ? 'max-h-[550px] opacity-100' 
            : 'max-h-0 opacity-0'
        } mt-2 sm:mt-4`} style={{minHeight: isTitleMoved ? '350px' : '0px'}}>          
        <SignInComp 
            isVisible={isLogin && !isRegistering && !isForgotPassword} 
            onRegister={() => {
              setIsRegistering(true)
              setIsLogin(false)
              setIsForgotPassword(false)
            }}
            onForgotPassword={() => {
              setIsForgotPassword(true)
              setIsLogin(false)
              setIsRegistering(false)
            }}
            className={`transition-all duration-500 ease-in-out transform ${
              isRegistering || isForgotPassword ? 'translate-x-[-200%] opacity-0' : 'translate-x-0'
            }`}
          />
          <RegisterComp 
            isVisible={isRegistering && !isLogin && !isForgotPassword} 
            onBack={() => {
              setIsRegistering(false)
              setIsLogin(true)
              setIsForgotPassword(false)
            }}
            className={`transition-all duration-500 ease-in-out transform ${
              isRegistering ? 'translate-x-0' : 'translate-x-[200%] opacity-0'
            }`}
          />
          <ForgotPasswordComp
            isVisible={isForgotPassword && !isLogin && !isRegistering}
            onBack={() => {
              setIsForgotPassword(false)
              setIsLogin(true)
              setIsRegistering(false)
            }}
            className={`transition-all duration-500 ease-in-out transform ${
              isForgotPassword ? 'translate-x-0' : 'translate-x-[200%] opacity-0'
            }`}
          />
        </div>        
        <div className={`transition-opacity duration-500 ${isTitleMoved ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button            
            onClick={() => {
              setIsLogin(true)
              setTimeout(() => {
                setIsTitleMoved(true)
              }, 100)
            }}
            className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-4 px-4 rounded-full flex items-center mt-4 hvr-icon-bob cursor-pointer'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 hvr-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
            </svg>          
          </button>
        </div>
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
          theme="light"/>
    </div>
  )
}
