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

import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

export default function SEOHelmet({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords,
  noIndex = false
}) {
  const siteTitle = 'Pickup Basketball';
  const defaultDescription = 'Scopri e prenota campi da basket nella tua città. Organizza partite e trova altri giocatori appassionati di basket.';
  const defaultImage = '/newLogo.jpg';
  const baseUrl = 'https://pickup-basketball.vercel.app';
  
  const fullTitle = title ? `${title} - ${siteTitle}` : siteTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const fullImageUrl = finalImage.startsWith('http') ? finalImage : `${baseUrl}${finalImage}`;
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
  
  // Debug: Log per verificare se il componente viene renderizzato
  useEffect(() => {
    console.log('🚀 SEOHelmet mounted with title:', fullTitle);
    
    // Verifica dopo un breve delay se i tag sono stati applicati
    setTimeout(() => {
      const currentTitle = document.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      console.log('📋 Current DOM state:', {
        documentTitle: currentTitle,
        metaDescription: metaDescription?.getAttribute('content') || 'NOT FOUND'
      });
    }, 500);
  }, [fullTitle]);
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Robots meta tag */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Additional meta tags for basketball/sports context */}
      <meta name="theme-color" content="#f97316" />
      <meta name="application-name" content={siteTitle} />
      
      {/* Additional useful meta tags */}
      <meta name="author" content={siteTitle} />
      <meta name="generator" content="React, Vite" />
    </Helmet>
  );
}
