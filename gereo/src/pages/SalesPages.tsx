import React, { useState, useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format'; // For currency formatting

// Types
interface Product {
    id: number;
    name: string;
    selling_price: number;
    current_stock: number;
    reference_code?: string; // Optional reference code
}

interface InvoiceItem {
    id: string; // Temporary ID for list rendering
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number; // Original selling price
    discount_percent: number;
    unit_price_after_discount: number;
    total: number;
    available_stock: number;
}

interface Settings {
    company_nif?: string;
    company_stat?: string;
    // Add other settings as needed
}


export function SalesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Settings>({});
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [itemTotal, setItemTotal] = useState<number>(0);

    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [isCreditSale, setIsCreditSale] = useState<boolean>(false);
    const [customerName, setCustomerName] = useState<string>('');
    const [amountPaid, setAmountPaid] = useState<number>(0);

    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');


    // Fetch initial data
    useEffect(() => {
        window.stock.getProducts().then(result => {
            if (result.success) {
                setProducts(result.products || []);
            } else {
                setError('Impossible de charger les produits.');
            }
        });
        window.settings.getSettings().then(result => {
             if (result.success) {
                setSettings(result.settings || {});
            } else {
                 console.error('Could not load settings');
             }
        })
    }, []);

    // Update unit price and item total when product or quantity/discount changes
    useEffect(() => {
        const selectedProduct = products.find(p => p.id === Number(selectedProductId));
        if (selectedProduct) {
            const price = selectedProduct.selling_price || 0;
            const discountAmount = price * (discountPercent / 100);
            const finalPrice = price - discountAmount;
            setUnitPrice(price); // Show original price in unit price field
            setItemTotal(finalPrice * quantity);
        } else {
            setUnitPrice(0);
            setItemTotal(0);
        }
    }, [selectedProductId, quantity, discountPercent, products]);

    // Calculate invoice totals
    const { subtotal, totalDiscountAmount, grandTotal, remainingAmount } = useMemo(() => {
        const sub = invoiceItems.reduce((sum, item) => sum + item.total, 0);
        const discountTotal = invoiceItems.reduce((sum, item) => sum + (item.unit_price * item.quantity * (item.discount_percent / 100)), 0);
        // Add TAX later if needed const tax = sub * 0.20;
        const total = sub; // + tax;
        const remaining = total - amountPaid;
        return { subtotal: sub, totalDiscountAmount: discountTotal, grandTotal: total, remainingAmount: remaining };
    }, [invoiceItems, amountPaid]);

    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        const selectedProduct = products.find(p => p.id === Number(productId));
        if (selectedProduct) {
            setUnitPrice(selectedProduct.selling_price || 0);
            setQuantity(1); // Reset quantity
            setDiscountPercent(0); // Reset discount
        } else {
            setUnitPrice(0);
        }
    };

    const handleAddItem = () => {
        setError('');
        const selectedProduct = products.find(p => p.id === Number(selectedProductId));
        if (!selectedProduct || quantity <= 0) {
            setError('Veuillez sélectionner un produit et entrer une quantité valide.');
            return;
        }

        if (quantity > selectedProduct.current_stock) {
            setError(`Stock insuffisant pour ${selectedProduct.name}. Disponible : ${selectedProduct.current_stock}`);
            return;
        }

        const price = selectedProduct.selling_price || 0;
        const discountAmount = price * (discountPercent / 100);
        const finalPricePerUnit = price - discountAmount;
        const totalForItem = finalPricePerUnit * quantity;

        const newItem: InvoiceItem = {
            id: Date.now().toString(), // Simple temporary ID
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: quantity,
            unit_price: price, // Store original price
            discount_percent: discountPercent,
            unit_price_after_discount: finalPricePerUnit,
            total: totalForItem,
            available_stock: selectedProduct.current_stock,
        };

        // Check if item already exists, if so, update quantity (optional, simple add for now)
        setInvoiceItems([...invoiceItems, newItem]);

        // Reset form for next item
        setSelectedProductId('');
        setQuantity(1);
        setDiscountPercent(0);
        setUnitPrice(0);
        setItemTotal(0);
    };

    const handleRemoveItem = (itemId: string) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
    };

    const handleSaveSale = async () => {
        setError('');
        setSuccessMessage('');

        if (invoiceItems.length === 0) {
            setError('Veuillez ajouter au moins un produit à la facture.');
            return;
        }

        if (isCreditSale && !customerName.trim()) {
            setError('Le nom du client est requis pour une vente à crédit.');
            return;
        }

        // Final stock check before saving
        for (const item of invoiceItems) {
            const product = products.find(p => p.id === item.product_id);
            if (!product || item.quantity > product.current_stock) {
                 setError(`Stock final insuffisant pour ${item.product_name}. Disponible : ${product?.current_stock ?? 0}`);
                 return;
            }
        }


        const saleData = {
            customer_name: customerName.trim() || null,
            is_credit_sale: isCreditSale,
            items: invoiceItems.map(item => ({ // Send only necessary data
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price_after_discount: item.unit_price_after_discount,
                total: item.total
            })),
            total_amount: grandTotal,
            discount_total: totalDiscountAmount,
            amount_paid: amountPaid
        };

        const result = await window.sales.saveSale(saleData);

        if (result.success) {
            setSuccessMessage(`Vente enregistrée avec succès ! Facture ID: ${result.invoiceId}`);
            // Reset entire form
            setInvoiceItems([]);
            setCustomerName('');
            setIsCreditSale(false);
            setAmountPaid(0);
             // Refetch products to update stock display
             window.stock.getProducts().then(res => {
                if (res.success) setProducts(res.products || []);
            });
        } else {
            setError(result.message || 'Erreur lors de l\'enregistrement.');
        }
    };

    const handleCancelSale = () => {
         setError('');
         setSuccessMessage('');
         setInvoiceItems([]);
         setCustomerName('');
         setIsCreditSale(false);
         setAmountPaid(0);
         setSelectedProductId('');
         setQuantity(1);
         setDiscountPercent(0);
         setUnitPrice(0);
         setItemTotal(0);
    }

    // TODO: Implement handlePrintInvoice

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-background-dark border-b border-border-light dark:border-border-dark shrink-0">
                <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Gestion des Ventes</h1>
                </div>
                 <div className="flex items-center space-x-6">
                    <div className="text-sm">
                        <span className="font-medium text-text-light-secondary dark:text-text-dark-secondary">NIF:</span>
                        <span className="font-semibold text-text-light dark:text-text-dark">{settings.company_nif || 'N/A'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-medium text-text-light-secondary dark:text-text-dark-secondary">STAT:</span>
                        <span className="font-semibold text-text-light dark:text-text-dark">{settings.company_stat || 'N/A'}</span>
                    </div>
                    {/* Add User Avatar/Notification later */}
                </div>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                 {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                 {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

                {/* Add Item Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary" htmlFor="product">Produit</label>
                            <select
                                className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark"
                                id="product"
                                value={selectedProductId}
                                onChange={(e) => handleProductSelect(e.target.value)}
                            >
                                <option value="">Sélectionner un produit</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.reference_code}) - Stock: {product.current_stock}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary" htmlFor="quantity">Quantité</label>
                            <input
                                className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark"
                                id="quantity" type="number" min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                disabled={!selectedProductId}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary" htmlFor="unit-price">Prix Unit. (Ar)</label>
                            <NumericFormat
                                className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark bg-gray-100 dark:bg-gray-600"
                                id="unit-price"
                                value={unitPrice}
                                thousandSeparator=" "
                                decimalSeparator=","
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary" htmlFor="discount">Remise (%)</label>
                            <input
                                className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark"
                                id="discount" type="number" min="0" max="100"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                disabled={!selectedProductId}
                            />
                        </div>
                        <div className="lg:col-span-1">
                             <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary" htmlFor="total-amount">Total Ligne (Ar)</label>
                             <NumericFormat
                                className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-100 dark:bg-gray-600 dark:text-text-dark"
                                id="total-amount"
                                value={itemTotal}
                                thousandSeparator=" "
                                decimalSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleAddItem}
                            disabled={!selectedProductId || quantity <= 0}
                            className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined mr-2">add_shopping_cart</span>
                            Ajouter à la facture
                        </button>
                    </div>
                </div>

                {/* Invoice Items Section */}
                <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Éléments de la facture</h2>
                        <div className="flex items-center mt-4 md:mt-0 space-x-4">
                            <div className="flex items-center">
                                <input
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    id="credit-sale" type="checkbox"
                                    checked={isCreditSale}
                                    onChange={(e) => setIsCreditSale(e.target.checked)}
                                />
                                <label className="ml-2 block text-sm text-text-light-secondary dark:text-text-dark-secondary" htmlFor="credit-sale">Vente à crédit</label>
                            </div>
                            <div className="w-48">
                                <label className="sr-only" htmlFor="customer-name">Nom du client</label>
                                <input
                                    className="block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark"
                                    id="customer-name" placeholder="Nom du client" type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Produit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Qté</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">P.U.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Remise</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Total</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Suppr.</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-border-light dark:divide-border-dark">
                                {invoiceItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">{item.product_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                            <NumericFormat value={item.unit_price} displayType={'text'} thousandSeparator=" " decimalSeparator="," prefix="Ar " />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">{item.discount_percent}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-light dark:text-text-dark">
                                             <NumericFormat value={item.total} displayType={'text'} thousandSeparator=" " decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="Ar " />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-error hover:text-error/80">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {invoiceItems.length === 0 && (
                                     <tr><td colSpan={6} className="text-center py-4 text-gray-500">Aucun produit ajouté à la facture.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Totals Section */}
                     <div className="mt-6 flex flex-col items-end space-y-2">
                        <div className="flex justify-between w-full max-w-xs">
                            <span className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Sous-total:</span>
                            <span className="text-sm font-semibold text-text-light dark:text-text-dark">
                                <NumericFormat value={subtotal} displayType={'text'} thousandSeparator=" " decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="Ar " />
                            </span>
                        </div>
                       {/* Add Tax display if needed */}
                        <div className="flex justify-between w-full max-w-xs">
                            <span className="text-lg font-bold text-text-light dark:text-text-dark">Total Général:</span>
                            <span className="text-lg font-bold text-text-light dark:text-text-dark">
                                 <NumericFormat value={grandTotal} displayType={'text'} thousandSeparator=" " decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="Ar " />
                            </span>
                        </div>
                         <div className="flex justify-between items-center w-full max-w-xs mt-2 border-t pt-2 border-border-light dark:border-border-dark">
                            <label htmlFor="amount-paid" className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Montant Payé:</label>
                             <NumericFormat
                                className="block w-28 rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-text-dark text-right"
                                id="amount-paid"
                                value={amountPaid}
                                thousandSeparator=" "
                                decimalSeparator=","
                                decimalScale={2}
                                allowNegative={false}
                                onValueChange={(values) => setAmountPaid(values.floatValue || 0)}
                                disabled={invoiceItems.length === 0}
                                prefix="Ar "
                            />
                        </div>
                        <div className="flex justify-between w-full max-w-xs">
                            <span className={`text-sm font-medium ${remainingAmount > 0 ? 'text-error' : 'text-text-light-secondary dark:text-text-dark-secondary'}`}>
                                Reste à Payer:
                            </span>
                            <span className={`text-sm font-semibold ${remainingAmount > 0 ? 'text-error' : 'text-text-light dark:text-text-dark'}`}>
                                <NumericFormat value={remainingAmount} displayType={'text'} thousandSeparator=" " decimalSeparator="," decimalScale={2} fixedDecimalScale prefix="Ar " />
                            </span>
                        </div>
                    </div>
                </div>

                 {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={handleCancelSale}
                        className="flex items-center justify-center rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-text-light dark:text-text-dark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                     >
                        Annuler
                    </button>
                    <button
                        onClick={handleSaveSale}
                        disabled={invoiceItems.length === 0}
                        className="flex items-center justify-center rounded-md border border-transparent bg-gray-200 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-text-light dark:text-text-dark shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined mr-2">save</span>
                        Enregistrer Vente
                    </button>
                    <button
                        // onClick={handlePrintInvoice} TODO
                        disabled={invoiceItems.length === 0}
                        className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined mr-2">print</span>
                        Imprimer Facture
                    </button>
                </div>
            </main>
        </div>
    );
}