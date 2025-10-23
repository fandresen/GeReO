import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Créer des composants pour les icônes
const Icon = ({ name }) => <span className="material-symbols-outlined mr-3">{name}</span>;

const navItems = [
  { name: 'Dashboard', icon: 'dashboard', path: '/' },
  { name: 'Products', icon: 'inventory', path: '/products' },
  { name: 'Stock Entry', icon: 'add_shopping_cart', path: '/stock-entry' },
  { name: 'Ventes', icon: 'shopping_cart', path: '/sales' },
  { name: 'Dépenses', icon: 'receipt_long', path: '/expenses' },
  { name: 'Rapports', icon: 'bar_chart', path: '/reports' },
  { name: 'Paramètres', icon: 'settings', path: '/settings' },
];

export function Sidebar() {
  const { logout } = useAuth();
  const activeLinkClass = "bg-primary text-white";
  const inactiveLinkClass = "text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <aside className="w-64 flex flex-col bg-white dark:bg-background-dark border-r border-border-light dark:border-border-dark">
      <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark shrink-0">
        {/* ... Votre SVG logo ici ... */}
        <span className="ml-3 text-lg font-bold text-text-light dark:text-text-dark">GeReO</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            end // pour que le 'Dashboard' ne soit pas toujours actif
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <Icon name={item.icon} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border-light dark:border-border-dark">
        <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <Icon name="logout" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}