import { useState } from 'react'
import { forgotPassword } from '../../api/authApi'
import FloatingLabel from '../utils/FloatingLabel'
import { toast } from 'react-toastify'

export default function ForgotPasswordComp({ isVisible, onBack, className }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Inserisci un indirizzo email valido')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simuliamo un ritardo minimo per evitare attacchi di timing
      const startTime = Date.now()
      
      // Chiamata API
      const response = await forgotPassword(email)
      
      // Assicuriamo che passino almeno 1 secondo dall'inizio per uniformare il tempo di risposta
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime))
      }
      
      // Sempre impostato a true, indipendentemente dall'esistenza dell'email
      setIsSuccess(true)
      
      // Non mostriamo più toast per non dare indizi sulla riuscita dell'operazione
    } catch (err) {
      // Gestiamo solo errori critici del server
      toast.error(err.message || 'Errore del server. Riprova più tardi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setIsSuccess(false)
    onBack()
  }

  return (
    <div className={`absolute left-0 right-0 mx-auto max-w-md transition-all duration-1000 ease-in-out transform ${
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0 z-10' 
        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none z-0'
    } ${className}`}>
      <form className='bg-none p-6 text-black' onSubmit={handleSubmit}>
        <h2 className='text-xl font-semibold text-center mb-4 text-white'>Recupero Password</h2>
        
        {!isSuccess ? (
          <>
            <p className='text-sm text-white mb-4'>
              Inserisci la tua email per ricevere un link di recupero password
            </p>
            <FloatingLabel 
              id="forgot-email" 
              type="email" 
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className='flex flex-col justify-center items-center mt-4'>
              <button 
                type="submit"
                disabled={isSubmitting}
                className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia email di recupero'}
              </button>
              <button 
                type='button'
                onClick={onBack}
                className='transition duration-500 text-white hover:text-red-300 p-2 mt-2 cursor-pointer hover:bg-red-50/20 rounded-3xl'
              >
                Torna al login
              </button>
            </div>
          </>
        ) : (
          <div className='text-center'>
            <p className='text-white mb-3'>
              Abbiamo inviato un'email a <span className='font-semibold'>{email}</span> con le istruzioni per recuperare la password.
            </p>
            <p className='text-white mb-4'>
              Controlla la tua casella di posta e segui il link contenuto nell'email.
            </p>
            <button 
              type='button'
              onClick={resetForm}
              className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-1 cursor-pointer mx-auto'>
              Torna al login
            </button>          
           </div>
        )}
      </form>
    </div>
  )
}
