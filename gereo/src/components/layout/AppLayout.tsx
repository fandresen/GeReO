import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* L'en-tête (Header) pourrait être un autre composant ici */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet /> {/* Les pages s'afficheront ici */}
        </main>
      </div>
    </div>
  );
}