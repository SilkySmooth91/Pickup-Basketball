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

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faBars, faTimes, faArrowRightFromBracket, faLightbulb, faBasketball } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import '/src/styles/HeaderComp.css'
import logo from '../../assets/newLogo.jpg';
import { faUser } from "@fortawesome/free-regular-svg-icons";
import ImageWithFallback from "./ImageWithFallback";
import NotificationDropdown from "./NotificationDropdown";

export default function HeaderComp() {
  const { user, accessToken, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenMobile, setDropdownOpenMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRefMobile = useRef(null);
  const navigate = useNavigate();

  // Controllo se l'utente è autenticato
  const isAuthenticated = !!user;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (dropdownRefMobile.current && !dropdownRefMobile.current.contains(event.target)) {
        setDropdownOpenMobile(false);
      }
    }
    
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setDropdownOpenMobile(false);
      }
    }
    
    if (dropdownOpen || dropdownOpenMobile) {
      // Use capture phase to ensure our handler runs before map handlers
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("keydown", handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dropdownOpen, dropdownOpenMobile]);

  // Logout handler
  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      setDropdownOpenMobile(false);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Errore durante il logout");
      }
      toast.success("Logout effettuato con successo!");
    } catch (e) {
      toast.error(e.message || "Errore di rete durante il logout");
    }
    logout();
    navigate("/");
  };

  // Mobile nav links
  const navLinks = (
    <ul className="flex flex-col md:flex-row justify-center text-base font-medium">
      {/* Mostra i link a pagine protette solo se l'utente è autenticato */}
      {isAuthenticated ? (
        <>
          <li className="inline-block">
            <Link 
              to="/map" 
              className="relative hvr-bounce-to-bottom px-4 py-2 rounded transition-colors" 
              onClick={() => {setMobileMenuOpen(false); setDropdownOpen(false); setDropdownOpenMobile(false);}}>
              Mappa
            </Link>
          </li>
          <li className="inline-block">
            <Link 
              to="/events" 
              className="relative hvr-bounce-to-bottom px-4 py-2 rounded transition-colors" 
              onClick={() => {setMobileMenuOpen(false); setDropdownOpen(false); setDropdownOpenMobile(false);}}>
              I tuoi eventi
            </Link>
          </li>
          <li className="inline-block">
            <Link 
              to="/players" 
              className="relative hvr-bounce-to-bottom px-4 py-2 rounded transition-colors" 
              onClick={() => {setMobileMenuOpen(false); setDropdownOpen(false); setDropdownOpenMobile(false);}}>
              Cerca giocatori
            </Link>
          </li>
        </>
      ) : null}
      {/* Link pubblico sempre visibile */}
      <li className="inline-block">
        <Link 
          to="/about" 
          className="relative hvr-bounce-to-bottom px-4 py-2 rounded transition-colors" 
          onClick={() => {setMobileMenuOpen(false); setDropdownOpen(false); setDropdownOpenMobile(false);}}>
          About
        </Link>
      </li>
    </ul>
  );  return (
    <header className="w-full bg-white shadow-md sticky top-0" style={{ zIndex: 'var(--z-header)' }}>
      <nav className="container mx-auto flex items-center justify-between px-4 py-2 relative">
        {/* Mobile layout: burger left, logo center, avatar right */}
        <div className="flex items-center justify-between w-full md:hidden">
          {/* Burger menu (mobile only, left) */}
          <button
            className="flex items-center text-2xl text-orange-500 focus:outline-none"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Apri menu">
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>

          {/* Logo & Title (center, mobile) */}
          <Link to="/" className="flex flex-row items-center justify-center md:gap-1 flex-1">
            <ImageWithFallback src={logo} alt="Logo" className="h-9 w-9 object-contain select-none"/>
            <span className="text-xl font-bold text-center text-orange-600 leading-none" style={{ letterSpacing: 1 }}>
              PickupBasketball
            </span>
          </Link>

          {/* Notifications & Avatar (right, mobile) - mostra solo se autenticato */}
          {isAuthenticated && (
            <div className="flex items-center md:gap-2">
              {/* Notification Bell Mobile */}
              <NotificationDropdown />
              
              {/* Avatar & Dropdown Mobile */}
              <div className="relative" ref={dropdownRefMobile}>
                <button
                  className="flex items-center ml-2 md:m-0 md:gap-2 focus:outline-none"
                  onClick={() => setDropdownOpenMobile((v) => !v)}
                  aria-label="User menu">
                  <ImageWithFallback
                    src={user?.avatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border-2 border-orange-500 object-cover shadow"/>
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" />
                </button>
              {dropdownOpenMobile && (
                <div className="absolute right-0 top-10 mt-2 w-40 dropdown-menu py-2 animate-fade-in" style={{ 
                  zIndex: 'var(--z-dropdown)'
                }}>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 cursor-pointer"
                    onClick={() => setDropdownOpenMobile(false)}>
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-600" />
                    Profilo
                  </Link>
                  <Link
                    to="/favorite-courts"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 cursor-pointer"
                    onClick={() => setDropdownOpenMobile(false)}>
                    <FontAwesomeIcon icon={faBasketball} className="mr-2 text-orange-600" />
                    Campetti preferiti
                  </Link>
                  <Link
                    to="/whats-new"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 cursor-pointer"
                    onClick={() => setDropdownOpenMobile(false)}>
                    <FontAwesomeIcon icon={faLightbulb} className="mr-2 text-orange-600" />
                    What's new
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 cursor-pointer"
                    onClick={handleLogout}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2 text-orange-600" />
                    Logout
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
          {/* Placeholder vuoto per mantenere il layout quando non c'è l'avatar */}
          {!isAuthenticated && <div className="w-9"></div>}
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Logo (desktop) */}
          <Link to="/" className="flex items-center gap-2 text-orange-600 font-bold text-2xl">
            <ImageWithFallback src={logo} alt="Logo" className="h-10 w-10 object-contain select-none" style={{marginRight: 4}} />
            <span className="hidden sm:inline">PickupBasketball</span>
          </Link>

          {/* Nav links */}
          <div className="flex-1 flex justify-center">
            {navLinks}
          </div>

          {/* Notifications & Avatar (desktop) - mostra solo se autenticato */}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationDropdown />
              
              {/* Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-label="User menu">
                  <ImageWithFallback
                    src={user?.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover shadow"/>
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" />
                </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-11 mt-2 w-48 dropdown-menu py-2 animate-fade-in" style={{ 
                  zIndex: 'var(--z-dropdown)'
                }}>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                    onClick={() => setDropdownOpen(false)}>
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-600" />
                    Profilo
                  </Link>
                  <Link
                    to="/favorite-courts"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                    onClick={() => setDropdownOpen(false)}>
                    <FontAwesomeIcon icon={faBasketball} className="mr-2 text-orange-600" />
                    Campetti preferiti
                  </Link>
                  <Link
                    to="/whats-new"
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                    onClick={() => setDropdownOpen(false)}>
                    <FontAwesomeIcon icon={faLightbulb} className="mr-2 text-orange-600" />
                    What's new
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 cursor-pointer"
                    onClick={handleLogout}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2 text-orange-600" />
                    Logout
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile menu overlay */}
        <div
          className={`
            fixed inset-0 bg-black/40 md:hidden
            transition-opacity duration-300
            ${mobileMenuOpen ? 'opacity-100 pointer-events-auto mobile-menu-open' : 'opacity-0 pointer-events-none'}
          `}
          style={{ zIndex: 'var(--z-mobile-menu)' }}
          onClick={() => setMobileMenuOpen(false)}>
          <div
            className={`
              absolute top-0 left-0 w-3/4 max-w-xs h-full bg-white shadow-lg p-6 flex flex-col gap-4
              transition-transform duration-300
              ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            onClick={e => e.stopPropagation()}>
            {navLinks}
          </div>
        </div>
      </nav>
    </header>
  );
}