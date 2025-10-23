import React from 'react';
type statCardT={ title: string; value: string;icon?:string; trendIcon?: string; iconBg: string; trendColor: string; }

// Créez un composant réutilisable pour les cartes de statistiques
const StatCard = ({ title, value, icon, iconBg, trendIcon, trendColor }:statCardT) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-light dark:text-text-dark">{value}</p>
      </div>
      <div className={`p-3 ${iconBg} rounded-full`}>
        <span className="material-symbols-outlined" style={{ color: trendColor }}>{trendIcon || icon}</span>
      </div>
    </div>
  </div>
);


export function DashboardPage() {
    // Les données des graphiques seront dynamiques plus tard
    return (
        <>
            <h1 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Ventes du Jour" value="Ar 1,25M" trendIcon="trending_up" iconBg="bg-success/10" trendColor="#36B37E" />
                <StatCard title="Dépenses du Jour" value="Ar 350k" trendIcon="trending_down" iconBg="bg-error/10" trendColor="#DE350B" />
                <StatCard title="Revenu Mensuel" value="Ar 25M" icon="attach_money" iconBg="bg-primary/10" trendColor="#0052CC"/>
                <StatCard title="Revenu Annuel" value="Ar 300M" icon="account_balance_wallet" iconBg="bg-primary/10" trendColor="#0052CC"/>
                <StatCard title="Valeur du Stock" value="Ar 75M" icon="inventory" iconBg="bg-indigo-500/10" trendColor="#6554C0"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Ventes Mensuelles</h3>
                  {/* Le composant de graphique viendra ici */}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Dépenses par Catégorie</h3>
                   {/* Le composant de graphique viendra ici */}
              </div>
            </div>
        </>
    );
}