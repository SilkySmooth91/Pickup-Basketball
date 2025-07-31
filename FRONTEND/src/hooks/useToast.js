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

import { useEffect, useState, useCallback } from 'react';
import { toast as reactToastify } from 'react-toastify';

/**
 * Hook personalizzato per gestire i toast con inizializzazione sicura del container
 */
export function useToast() {
  const [isContainerReady, setIsContainerReady] = useState(false);
  const [pendingToasts, setPendingToasts] = useState([]);
  const [hasTriedInit, setHasTriedInit] = useState(false);

  // Controlla se il container del toast è pronto
  const checkToastContainer = useCallback(() => {
    console.log('DEBUG: Checking toast container readiness');
    const container = document.querySelector('.Toastify__toast-container');
    const wrapper = document.querySelector('.Toastify');
    
    console.log('DEBUG: Container exists:', !!container);
    console.log('DEBUG: Wrapper exists:', !!wrapper);
    
    if (container) {
      console.log('DEBUG: Toast container is ready');
      setIsContainerReady(true);
      return true;
    }
    
    console.log('DEBUG: Toast container not ready yet');
    return false;
  }, []);

  // Strategia più aggressiva: forza la creazione con un toast visibile
  const forceContainerCreation = useCallback(() => {
    console.log('DEBUG: Force creating container with visible toast');
    
    // Usa un toast completamente normale per forzare la creazione
    const toastId = reactToastify.success('Initializing...', {
      position: "top-center",
      autoClose: 500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      toastId: 'force-init'
    });
    
    console.log('DEBUG: Forced toast created with ID:', toastId);
    
    // Controlla immediatamente
    setTimeout(() => {
      console.log('DEBUG: Checking immediately after forced toast');
      checkToastContainer();
    }, 0);
    
    // Controlla di nuovo dopo un delay
    setTimeout(() => {
      console.log('DEBUG: Checking after delay');
      if (checkToastContainer()) {
        console.log('DEBUG: Success! Container now exists');
        // Chiudi il toast di inizializzazione
        reactToastify.dismiss('force-init');
      }
    }, 100);
    
  }, [checkToastContainer]);

  // Effetto che si attiva solo quando necessario
  useEffect(() => {
    console.log('DEBUG: useToast hook initialized');
    
    // Non fare nulla automaticamente, aspetta che sia richiesto
    if (!checkToastContainer()) {
      console.log('DEBUG: Container not ready, but waiting for user interaction');
    }
  }, [checkToastContainer]);

  // Processa i toast in sospeso quando il container è pronto
  useEffect(() => {
    if (isContainerReady && pendingToasts.length > 0) {
      console.log('DEBUG: Processing pending toasts:', pendingToasts.length);
      
      pendingToasts.forEach(({ type, message, options }) => {
        console.log('DEBUG: Showing pending toast:', type, message);
        reactToastify[type](message, options);
      });
      
      setPendingToasts([]);
    }
  }, [isContainerReady, pendingToasts]);

  // Funzione toast sicura
  const safeToast = useCallback((type, message, options = {}) => {
    console.log('DEBUG: safeToast called:', type, message);
    console.log('DEBUG: Container ready state:', isContainerReady);
    console.log('DEBUG: Has tried init:', hasTriedInit);
    
    // Ricontrolla sempre lo stato attuale del DOM
    const currentCheck = checkToastContainer();
    console.log('DEBUG: Current container check result:', currentCheck);
    
    if (isContainerReady || currentCheck) {
      console.log('DEBUG: Showing toast immediately');
      reactToastify[type](message, options);
    } else {
      console.log('DEBUG: Container not ready, trying to force creation');
      
      if (!hasTriedInit) {
        console.log('DEBUG: First attempt to create container');
        setHasTriedInit(true);
        forceContainerCreation();
      }
      
      // Metti in coda il toast
      setPendingToasts(prev => {
        const newQueue = [...prev, { type, message, options }];
        console.log('DEBUG: Toast queue length:', newQueue.length);
        return newQueue;
      });
    }
  }, [isContainerReady, checkToastContainer, forceContainerCreation, hasTriedInit]);

  return {
    success: (message, options) => safeToast('success', message, options),
    error: (message, options) => safeToast('error', message, options),
    info: (message, options) => safeToast('info', message, options),
    warning: (message, options) => safeToast('warning', message, options),
    isReady: isContainerReady
  };
}
