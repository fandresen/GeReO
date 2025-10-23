import React from 'react';

// Logo GeReO en SVG pour un usage hors ligne
const GeReOLogo = () => (
  <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
  </svg>
);

export function LoginInfoPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-start w-1/2 p-12 bg-sky-50 rounded-l-xl">
      <div className="flex items-center mb-4">
        <GeReOLogo />
        <span className="ml-2 text-2xl font-bold text-gray-800">GeReO</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-800">Gérez votre stock, simplement.</h2>
      <p className="mt-4 text-gray-600">
        La solution complète pour les petites et moyennes entreprises à Madagascar.
      </p>
      <div className="mt-8 w-full">
        {/* Vous pouvez mettre un fichier .svg dans le dossier `public` pour qu'il soit accessible ici */}
        <img className="rounded-lg object-cover w-full h-auto" alt="Illustration de gestion de stock" src="/login-illustration.svg" />
      </div>
    </div>
  );
}