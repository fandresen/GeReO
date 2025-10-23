import React, { useState, useEffect } from 'react';

// Définition du type pour une entrée de stock (pour la clarté)
interface StockEntry {
  id: number;
  movement_date: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// Définition du type pour un produit
interface Product {
    id: number;
    name: string;
}

export function StockEntryPage() {
    const [entries, setEntries] = useState<StockEntry[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    // États pour le formulaire
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [error, setError] = useState('');

    // Fonction pour récupérer les données
    const fetchData = () => {
        window.stock.getStockEntries().then(result => {
            if (result.success) {
                setEntries(result.entries || []);
            }
        });
        window.stock.getProducts().then(result => {
            if (result.success) {
                setProducts(result.products || []);
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation simple
        if (!productId || !quantity || !unitPrice || Number(quantity) <= 0 || Number(unitPrice) < 0) {
            setError('Veuillez remplir tous les champs correctement. La quantité doit être supérieure à zéro.');
            return;
        }

        const newEntry = {
            movement_date: date,
            product_id: Number(productId),
            quantity: Number(quantity),
            unit_price: Number(unitPrice),
            movement_type: 'ENTRY', // Type de mouvement
        };

        const result = await window.stock.addStockEntry(newEntry);

        if (result.success) {
            // Réinitialiser le formulaire
            setProductId('');
            setQuantity('');
            setUnitPrice('');
            
            // Mettre à jour la liste des entrées
            fetchData(); 
        } else {
            setError(result.message || 'Une erreur est survenue lors de l\'enregistrement.');
        }
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enregistrer une entrée de stock</h1>
            </header>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Nouvelle entrée</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date">Date</label>
                            <input 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                id="date" 
                                name="date" 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                             />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="product">Produit</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600" 
                                id="product" 
                                name="product"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            >
                                <option value="">Sélectionner un produit</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="quantity">Quantité</label>
                            <input 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                id="quantity" 
                                name="quantity" 
                                placeholder="0" 
                                type="number" 
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="unit-price">Prix d'achat unitaire</label>
                            <input 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                id="unit-price" 
                                name="unit-price" 
                                placeholder="0.00" 
                                type="number"
                                step="0.01"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                            />
                        </div>
                    </div>
                     {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-6">
                        <div className="lg:col-start-5 flex items-end">
                            <button className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2" type="submit">
                                <span className="material-icons">save</span>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Historique des entrées de stock</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Produit</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Quantité</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Prix Unitaire</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {entries.map(entry => (
                                <tr key={entry.id}>
                                    <td className="p-4">{new Date(entry.movement_date).toLocaleDateString()}</td>
                                    <td className="p-4">{entry.product_name}</td>
                                    <td className="p-4">{entry.quantity}</td>
                                    <td className="p-4">Ar {Number(entry.unit_price).toFixed(2)}</td>
                                    <td className="p-4">Ar {(entry.quantity * entry.unit_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}