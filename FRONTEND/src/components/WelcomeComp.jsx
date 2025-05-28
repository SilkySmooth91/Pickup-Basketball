import { useState } from 'react'
import '/src/styles/WelcomeComp.css'
import SignInComp from './auth/SignInComp'
import RegisterComp from './auth/RegisterComp'

export default function WelcomeComp() {
  const [isTitleMoved, setIsTitleMoved] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <div className='h-screen flex flex-col justify-center items-center bg-[url(https://images.pexels.com/photos/680074/pexels-photo-680074.jpeg)] bg-bg-local bg-cover bg-center'>
        <div className={`mx-2 transition-all duration-800 ease-in-out ${isTitleMoved ? 'transform -translate-y-[22vh]' : ''}`}>
          <h1 className='text-4xl font-bold text-white text-center mb-2'>
            <span>Welcome to</span><br />
            Pickup Basketball!
          </h1>
          <h2 className='text-base italic text-white text-center'>
            L'App n.1 per organizzare e partecipare a partite di pickup basketball
          </h2>
        </div>

        <SignInComp 
          isVisible={isLogin} 
          onRegister={() => {
            setIsRegistering(true)
            setIsLogin(false)
          }}
          className={`absolute transition-all duration-500 ease-in-out transform ${
            isRegistering ? 'translate-x-[-200%] opacity-0' : 'translate-x-0'
          }`}
        />
        <RegisterComp 
          isVisible={isRegistering} 
          onBack={() => {
            setIsRegistering(false)
            setIsLogin(true)
          }}
          className={`absolute transition-all duration-500 ease-in-out transform ${
            isRegistering ? 'translate-x-0' : 'translate-x-[200%] opacity-0'
          }`}
        />

        <div className={`transition-opacity duration-200 delay-100 ${isTitleMoved ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={() => {
              setIsLogin(true)
              setIsTitleMoved(true)
            }}
            className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-4 px-4 rounded-full flex items-center mt-4 hvr-icon-bob'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 hvr-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
    </div>
  )
}
