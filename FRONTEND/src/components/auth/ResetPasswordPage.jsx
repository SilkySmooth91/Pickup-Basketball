import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/authApi'
import FloatingLabel from '../utils/FloatingLabel'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import logoImage from '../../assets/newLogo.jpg'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      toast.error('Token di reset mancante')
      navigate('/')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Le password non coincidono')
      return
    }

    if (password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(token, password)
      setIsSuccess(true)
      toast.success('Password aggiornata con successo')
    } catch (err) {
      toast.error(err.message || 'Errore durante il reset della password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToLogin = () => {
    navigate('/')
  }

  return (
    <div className='h-screen w-full flex flex-col justify-center items-center bg-[url(https://res.cloudinary.com/dyg6giw5q/image/upload/v1749401570/market-square-the-pass_xbyjvl.jpg)] bg-bg-local bg-cover bg-center bg-fixed'>
      <div className="flex justify-center items-center mb-6">            
        <img 
          src={logoImage} 
          alt="Pickup Basketball Logo" 
          className="w-auto max-w-[250px] md:max-w-[300px] h-auto"
        />
      </div>
      
      <div className="bg-white/90 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {!isSuccess ? (
          <>
            <h2 className='text-xl font-semibold text-center mb-4'>Reset Password</h2>
            <form onSubmit={handleSubmit}>
              <FloatingLabel
                id="reset-password"
                type="password"
                label="Nuova Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <FloatingLabel
                id="reset-confirm-password"
                type="password"
                label="Conferma Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <div className='flex flex-col justify-center items-center mt-4'>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-full justify-center'
                >
                  {isSubmitting ? 'Aggiornamento in corso...' : 'Aggiorna Password'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className='text-center'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className='text-xl font-semibold text-center mb-2 mt-2'>Password Aggiornata!</h2>
            <p className='mb-4'>
              La tua password è stata aggiornata con successo. Ora puoi accedere con la nuova password.
            </p>
            <button
              onClick={goToLogin}
              className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-1 cursor-pointer w-full justify-center'
            >
              Vai al Login
            </button>          </div>
        )}
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
        theme="light"
      />
    </div>
  )
}
