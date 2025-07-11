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

import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingLabel from '../utils/FloatingLabel'
import { loginUser, registerUser } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'


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
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione frontend
    if (
      !state.username.trim() ||
      !state.email.trim() ||
      !state.password.trim() ||
      !state.confirmPassword.trim()
    ) {
      toast.error("I campi contrassegnati con * sono obbligatori"); 
      return;
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]{1,64}@[^ -\s@]{1,255}\.[^\s@]{2,64}$/;
    if (!emailRegex.test(state.email.trim())) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    
    const ageNum = Number(state.age);
    if (state.age && (isNaN(ageNum) || ageNum < 13)) {
      toast.error("L'età deve essere un numero valido (minimo 13)");
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
      toast.success("Registrazione completata con successo!");
      dispatch({ type: 'RESET' });
      // Effettua login automatico dopo la registrazione
      const loginRes = await loginUser({ email: state.email, password: state.password });
      await login(loginRes.user, loginRes.accessToken, loginRes.refreshToken);
    } catch (err) {
      toast.error(err.message || "Errore durante la registrazione");
    }
  };  return (
    <div className={`flex justify-center absolute left-0 right-0 mx-auto max-w-md transition-all duration-1000 ease-in-out transform z-10 ${
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
    } ${className}`}>
      <form className="space-y-4 px-2 sm:px-0 pt-1" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <FloatingLabel
            id="nome-giocatore"
            type="text"
            label="Username *"
            className="flex-1"
            value={state.username}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'username', value: e.target.value })}/>
          <FloatingLabel
            id="email"
            type="email"
            label="Email *"
            className="flex-1"
            value={state.email}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}/>
        </div>
        <div className="flex gap-4">
          <FloatingLabel
            id="password"
            type="password"
            label="Password *"
            className="flex-1"
            value={state.password}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}/>
          <FloatingLabel
            id="confirm-password"
            type="password"
            label="Conferma Password *"
            className="flex-1"
            value={state.confirmPassword}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'confirmPassword', value: e.target.value })}/>
        </div>
        <div className="flex gap-4 mb-0">
          <FloatingLabel
            id="area-giocatore"
            type="text"
            label="La città dove giochi"
            className="flex-1"
            value={state.city}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'city', value: e.target.value })}/>
          <FloatingLabel
            id="età-giocatore"
            type="text"
            label="La tua età"
            className="flex-1"
            value={state.age}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'age', value: e.target.value })}/>
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button
            type="submit"
            className='transition duration-500 bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-3xl flex items-center mt-4 cursor-pointer'>
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
              className='transition duration-500 text-red-300 hover:text-red-500 p-2 cursor-pointer hover:bg-red-50/50 rounded-3xl'>
              Torna al login
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
