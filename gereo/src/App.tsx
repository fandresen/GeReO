import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AppLayout } from './components/layout/AppLayout';
// Créez des fichiers simples pour les autres pages pour l'instant
// ex: export const ProductsPage = () => <h1>Produits</h1>;

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          {/* Redirige vers /login si l'utilisateur n'est pas connecté */}
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            {/* <Route path="products" element={<ProductsPage />} /> */}
            {/* ... autres routes ... */}
          </Route>
          {/* Redirige vers la page d'accueil si l'utilisateur est connecté et essaie d'aller sur /login */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

export default App;