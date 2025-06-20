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

import HeaderComp from '../components/utils/HeaderComp';
import { faUsers, faMapLocationDot, faCalendarCheck, faComments } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/newLogo.jpg';
import BugReportForm from '../components/utils/BugReportForm';
import FeatureCard from '../components/utils/FeatureCard';
import ImageWithFallback from '../components/utils/ImageWithFallback';
import Footer from '../components/utils/Footer';

export default function AboutPage() {
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">      
      <HeaderComp />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl border-orange-500 border-l-4 overflow-hidden">                
            {/* Header */}            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1 text-white">
              <div className="flex items-center gap-4">
                <ImageWithFallback src={logo} alt="Logo" className="h-20 w-30 md:h-30 md:w-40 object-contain p-1" />
                <div>
                  <h1 className="text-xl md:text-3xl font-bold">Pickup Basketball</h1>
                  <p className="text-base md:text-xl opacity-90 mt-1">Trova partite, giocatori e campetti nella tua zona</p>
                </div>
              </div>
            </div>
            
            {/* Descrizione principale */}
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Benvenuto, streetballer!</h2>
              <p className="text-gray-700 text-lg mb-8">
                Pickup Basketball nasce come progetto finale del mio percorso di studi come programmatore. 
                <br />E' una piattaforma creata per connettere gli appassionati di basket e streetball e rendere più facile organizzare e partecipare a partite di basket nei campetti della tua zona. Con questa app puoi scoprire nuovi campetti, partecipare a eventi esistenti o crearne di nuovi, e connetterti con altri giocatori.<br />
                Divertiti a usarla e a giocare a basket! <br />
                Se hai suggerimenti o feedback, non esitare a contattarmi.
                <br />
                <br />
                <span className="font-semibold italic">- Lorenzo, sviluppatore e appassionato di basket</span>
              </p>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FeatureCard 
                  icon={faMapLocationDot} 
                  title="Trova Campetti"
                  description="Scopri i campetti da basket più vicini a te attraverso mappa interattiva. E se non trovi il tuo campetto preferito, puoi aggiungerlo facilmente!" />
                
                <FeatureCard 
                  icon={faCalendarCheck} 
                  title="Partecipa ad Eventi"
                  description="Trova partite in programma nella tua zona, unisciti o crea il tuo evento e invita altri giocatori a partecipare." />
                
                <FeatureCard 
                  icon={faUsers} 
                  title="Connettiti con Giocatori"
                  description="Cerca altri appassionati di basket, aggiungi amici e crea il tuo network di giocatori per organizzare partite più facilmente." />
                
                <FeatureCard 
                  icon={faComments} 
                  title="Community"
                  description="Interagisci con altri utenti, commenta eventi e campetti, condividi esperienze e suggerimenti." />
              </div>
              
              {/* Come iniziare */}
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h3 className="text-xl font-semibold text-orange-700 mb-3">Come iniziare:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Registrati e crea il tuo profilo personale</li>
                  <li>Esplora la mappa per trovare campetti nella tua zona</li>
                  <li>Cerca eventi esistenti a cui partecipare o crea il tuo</li>
                  <li>Trova altri giocatori e aggiungili come amici</li>
                  <li>Organizza partite e divertiti!</li>
                </ol>                </div>
                {/* Form segnalazione bug */}              
                <BugReportForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
