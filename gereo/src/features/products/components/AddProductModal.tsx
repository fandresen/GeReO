import React, { useState } from 'react';

// Définit le type pour un nouveau produit
interface NewProduct {
  name: string;
  reference_code: string;
  purchase_price: number;
  selling_price: number;
  wholesale_price: number;
  min_stock_alert: number;
  current_stock: number; // Valeur par défaut à 0
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsAdded: () => void; // Callback pour rafraîchir la liste
}

export function AddProductModal({ isOpen, onClose, onProductsAdded }: AddProductModalProps) {
  const [products, setProducts] = useState<NewProduct[]>([
    { name: '', reference_code: '', purchase_price: 0, selling_price: 0, wholesale_price: 0, min_stock_alert: 10, current_stock: 0 },
  ]);
  const [error, setError] = useState('');

  const handleInputChange = (index: number, field: keyof NewProduct, value: string | number) => {
    const newProducts = [...products];
    newProducts[index][field] = typeof newProducts[index][field] === 'number' ? Number(value) : value;
    setProducts(newProducts);
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      { name: '', reference_code: '', purchase_price: 0, selling_price: 0, wholesale_price: 0, min_stock_alert: 10, current_stock: 0 },
    ]);
  };

  const removeProductRow = (index: number) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const product of products) {
      if (!product.name || product.selling_price <= 0) {
        setError('Le nom du produit et le prix de vente sont requis pour tous les produits.');
        return;
      }
    }

    try {
        for (const product of products) {
            const result = await window.stock.addProduct(product);
            if (!result.success) {
                throw new Error(result.message || 'Une erreur est survenue lors de l\'ajout d\'un produit.');
            }
        }
        onProductsAdded();
    } catch (err: any) {
        setError(err.message);
    }
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ajouter un ou plusieurs produits</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <span className="material-icons">close</span>
          </button>
        </div>

        <form id="add-product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md dark:border-gray-700 relative">
              {products.length > 1 && (
                 <button
                    type="button"
                    onClick={() => removeProductRow(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                 >
                    <span className="material-icons text-base">delete</span>
                 </button>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du produit *</label>
                <input type="text" value={product.name} onChange={(e) => handleInputChange(index, 'name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Référence</label>
                <input type="text" value={product.reference_code} onChange={(e) => handleInputChange(index, 'reference_code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alerte stock min.</label>
                <input type="number" value={product.min_stock_alert} onChange={(e) => handleInputChange(index, 'min_stock_alert', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix d'achat</label>
                <input type="number" step="0.01" value={product.purchase_price} onChange={(e) => handleInputChange(index, 'purchase_price', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix de gros</label>
                <input type="number" step="0.01" value={product.wholesale_price} onChange={(e) => handleInputChange(index, 'wholesale_price', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix de vente *</label>
                <input type="number" step="0.01" value={product.selling_price} onChange={(e) => handleInputChange(index, 'selling_price', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" required />
              </div>
            </div>
          ))}
            <button type="button" onClick={addProductRow} className="mt-2 text-sm text-primary hover:underline flex items-center gap-1">
                <span className="material-icons text-base">add_circle_outline</span>
                Ajouter un autre produit
            </button>
             {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </form>

        <div className="mt-6 flex justify-end gap-4 border-t dark:border-gray-700 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-white">
            Annuler
          </button>
          <button type="submit" form="add-product-form" className="py-2 px-4 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold flex items-center gap-2">
            <span className="material-icons">save</span>
            Enregistrer les produits
          </button>
        </div>
      </div>
    </div>
  );
}