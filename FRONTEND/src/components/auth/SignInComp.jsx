import { useState } from 'react'
import FloatingLabel from '../utils/FloatingLabel'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/authApi';
import GoogleLoginButton from './GoogleLoginButton'

export default function SignInComp({ isVisible, onRegister, className }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const loginRes = await loginUser({ email, password });
      await login(loginRes.user, loginRes.accessToken, loginRes.refreshToken);
      navigate("/map") // Reindirizza a /map invece di /profile
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={`absolute top-75 transition-all duration-1000 ease-in-out transform ${
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
    } ${className}`}>
      <form className='bg-none p-6 text-black' onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {error}
          </div>
        )}
        <FloatingLabel 
          id="signin-email" 
          type="email" 
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <FloatingLabel 
          id="signin-password" 
          type="password" 
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className='flex flex-col justify-center items-center'>
          <button className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-1 cursor-pointer'>
            Accedi
          </button>
          <GoogleLoginButton
            className="transition duration-300 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-3xl flex items-center mt-3 w-full justify-center shadow-sm cursor-pointer"
            style={{ maxWidth: 200 }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.68 2.09 30.7 0 24 0 14.82 0 6.73 5.06 2.69 12.44l7.98 6.2C12.13 13.13 17.61 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.44c-.54 2.9-2.19 5.36-4.67 7.01l7.24 5.63C43.98 37.13 46.1 31.38 46.1 24.55z"/>
                <path fill="#FBBC05" d="M10.67 28.64A14.5 14.5 0 0 1 9.5 24c0-1.62.28-3.19.78-4.64l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.81.92 7.41 2.55 10.56l8.12-6.32z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.24-5.63c-2.01 1.35-4.6 2.16-8.66 2.16-6.39 0-11.87-3.63-14.33-8.86l-8.12 6.32C6.73 42.94 14.82 48 24 48z"/>
              </g>
            </svg>
            Accedi con Google
          </GoogleLoginButton>
          <div className='flex justify-start items-center mt-1 gap-2'>
            <p className='text-sm text-white ps-4'>oppure</p>
            <button 
              type='button'
              onClick={(e) => {
                e.preventDefault()
                onRegister()
              }}
              className='transition duration-500 text-red-300 hover:text-red-500 p-2 cursor-pointer hover:bg-red-50/50 rounded-3xl'>
              Registrati
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
