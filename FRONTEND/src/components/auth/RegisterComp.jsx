import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingLabel from '../utils/FloatingLabel'
import { loginUser, registerUser } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'


const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  city: ''
}


function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function RegisterComp({ isVisible, onBack, className }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Validazione frontend
    if (
      !state.username.trim() ||
      !state.email.trim() ||
      !state.password.trim() ||
      !state.confirmPassword.trim() ||
      !state.age.trim() ||
      !state.city.trim()
    ) {
      setError("Tutti i campi sono obbligatori");
      return;
    }
    const ageNum = Number(state.age);
    if (isNaN(ageNum) || ageNum < 13) {
      setError("L'età deve essere un numero valido (minimo 13)");
      return;
    }
    try {
      await registerUser({
        ...state,
        age: ageNum,
        username: state.username.trim(),
        email: state.email.trim(),
        password: state.password,
        confirmPassword: state.confirmPassword,
        city: state.city.trim()
      });
      dispatch({ type: 'RESET' });      // Effettua login automatico dopo la registrazione
      const loginRes = await loginUser({ email: state.email, password: state.password });
      await login(loginRes.user, loginRes.accessToken, loginRes.refreshToken);
      navigate('/map');
    } catch (err) {
      setError(err.message || "Errore durante la registrazione");
    }
  };

  return (
    <div className={`flex justify-center absolute left-0 right-0 top-75 sm:top-1/2 sm:-translate-y-1/2 mx-auto max-w-md transition-all duration-1000 ease-in-out transform z-10 ${
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
    } ${className}`}>
      <form className="space-y-4 px-2 sm:px-0" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <FloatingLabel
            id="nome-giocatore"
            type="text"
            label="Username"
            className="flex-1"
            value={state.username}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'username', value: e.target.value })}
          />
          <FloatingLabel
            id="email"
            type="email"
            label="Email"
            className="flex-1"
            value={state.email}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
          />
        </div>
        <div className="flex gap-4">
          <FloatingLabel
            id="password"
            type="password"
            label="Password"
            className="flex-1"
            value={state.password}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
          />
          <FloatingLabel
            id="confirm-password"
            type="password"
            label="Conferma Password"
            className="flex-1"
            value={state.confirmPassword}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'confirmPassword', value: e.target.value })}
          />
        </div>
        <div className="flex gap-4 mb-0">
          <FloatingLabel
            id="area-giocatore"
            type="text"
            label="La città dove giochi"
            className="flex-1"
            value={state.city}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'city', value: e.target.value })}
          />
          <FloatingLabel
            id="età-giocatore"
            type="text"
            label="La tua età"
            className="flex-1"
            value={state.age}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'age', value: e.target.value })}
          />
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button
            type="submit"
            className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-4'>
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
