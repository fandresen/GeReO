import React, { useEffect, useState } from 'react';
import { AddProductModal } from '../features/products/components/AddProductModal';
import { NavLink } from 'react-router-dom';

// Définition du type pour un produit
interface Product {
  id: number;
  name: string;
  reference_code: string;
  current_stock: number;
  min_stock_alert: number;
  purchase_price: number;
  wholesale_price: number;
  selling_price: number;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = () => {
    window.stock.getProducts().then(result => {
      if (result.success) {
        setProducts(result.products || []);
      }
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductsAdded = () => {
    fetchProducts(); // Rafraîchit la liste
    setIsModalOpen(false); // Ferme la modale
  }

  return (
    <>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductsAdded={handleProductsAdded}
      />
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Stock</h1>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <span className="material-icons">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            U
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Liste des produits</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <span className="material-icons">add</span>
              Ajouter un produit
            </button>
            <NavLink to="/stock-entry" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <span className="material-icons">add_shopping_cart</span>
                Faire une entrée de stock
            </NavLink>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Produit</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Stock Actuel</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Stock Min.</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Prix d'achat</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Prix de gros</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Prix de vente</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Valeur du stock</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">
                     <span className={
                        product.current_stock <= 0 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full text-sm font-semibold" :
                        product.current_stock <= product.min_stock_alert ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full text-sm font-semibold" :
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-sm"
                    }>
                        {product.current_stock}
                    </span>
                  </td>
                  <td className="p-4">{product.min_stock_alert}</td>
                  <td className="p-4">${product.purchase_price}</td>
                  <td className="p-4">${product.wholesale_price}</td>
                  <td className="p-4">${product.selling_price}</td>
                  <td className="p-4">${(product.purchase_price * product.current_stock).toFixed(2)}</td>
                  <td className="p-4">
                    <button className="text-primary hover:underline">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}