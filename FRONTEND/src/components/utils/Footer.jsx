import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketball } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {  return (
    <footer className="bg-transparent p-4">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-100 mx-auto max-w-4xl p-4 
                    transform hover:translate-y-[-5px] transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <FontAwesomeIcon icon={faBasketball} className="text-orange-500 text-xl mr-2" bounce />
              <span className="font-semibold text-orange-600">Pickup Basketball</span>
            </div>
            
            <p className="text-center text-gray-600 mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} Pickup Basketball. Tutti i diritti riservati.
            </p>
            
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>            
            </div>
          </div>
        </div>
      </div>
    </footer>  );
}
