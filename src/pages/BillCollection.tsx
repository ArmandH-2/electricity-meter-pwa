import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, Download, Search, DollarSign } from 'lucide-react';
import { BillCard } from '../components/BillCard';
import { useToast } from '../components/ToastProvider';
import { BillRepository, LogRepository } from '../db/repositories';
import { parseExcel, exportToExcel } from '../services/excel';
import type { Bill } from '../db/types';


export const BillCollectionPage: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        setLoading(true);
        try {
            const data = await BillRepository.getAll();
            setBills(data);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setLoading(true);
        try {
            // Parse as array of arrays to handle files with or without headers
            const rawData = await parseExcel<any[]>(file, { header: 1 });


            if (!rawData || rawData.length === 0) {
                throw new Error("No data found in the Excel file.");
            }

            // Remove header row if it exists
            let dataRows = rawData;
            const firstRow = rawData[0];
            if (firstRow && typeof firstRow[0] === 'string' &&
                (firstRow[0].toLowerCase().includes('code') || firstRow[0].toLowerCase().includes('branch'))) {
                dataRows = rawData.slice(1);
            }

            // Map data by index
            // Expected Order: Code, Branch, Installation, Name, BillLBP, BillUSD
            const mappedData: Bill[] = dataRows.map((row: any[]): Bill | null => {
                // Ensure we have enough columns, or at least try to map what we have
                if (!row || row.length < 3) return null;

                return {
                    code: String(row[0] || ''),
                    branchID: String(row[1] || ''), // Note: Swapped Branch and Installation based on user error order? 
                    // User Error: 44318 (Code), 76863 (Branch), 50 440 053 11 (Inst)
                    // So Index 1 is Branch, Index 2 is Installation
                    installationID: String(row[2] || ''),
                    name: String(row[3] || ''),
                    billLBP: Number(row[4] || 0),
                    billUSD: Number(row[5] || 0),
                    paymentStatus: 'unpaid',
                    paymentDate: null
                };
            }).filter((item): item is Bill => item !== null);

            if (mappedData.length === 0) {
                throw new Error(`Could not map data. Please ensure the file has columns in this order: Code, Branch, Installation, Name, BillLBP, BillUSD.`);
            }

            await BillRepository.addAll(mappedData);
            await loadBills();
            showToast(`Successfully imported ${mappedData.length} bills`, 'success');
        } catch (error) {
            console.error("Import failed", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            showToast(`Import failed: ${message}`, 'error');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExport = () => {
        exportToExcel(bills, `bills_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Bills exported successfully', 'success');
    };

    const togglePayment = async (bill: Bill) => {
        if (!bill.id) return;
        const newStatus = bill.paymentStatus === 'paid' ? 'unpaid' : 'paid';
        const updated: Bill = {
            ...bill,
            paymentStatus: newStatus,
            paymentDate: newStatus === 'paid' ? new Date().toISOString() : null
        };
        // Optimistic update
        setBills(prev => prev.map(b => b.id === bill.id ? updated : b));
        try {
            await BillRepository.update(updated);

            // Log the action
            await LogRepository.add(
                'Payment',
                `"${bill.name}" marked as ${newStatus.toUpperCase()}`
            );

            showToast(newStatus === 'paid' ? 'Marked as Paid' : 'Marked as Unpaid', 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
            // Revert
            setBills(prev => prev.map(b => b.id === bill.id ? bill : b));
        }
    };

    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');



    const filteredBills = useMemo(() => {
        return bills.filter(b => {
            // 1. Split search into individual words (tokens)
            const searchTokens = search.toLowerCase().trim().split(/\s+/);

            // 2. Create a single searchable string from the record fields
            const searchableText = `
                ${b.name} 
                ${b.code} 
                ${b.installationID} 
                ${b.branchID}
            `.toLowerCase();

            // 3. Check if EVERY token exists in the searchable text
            const matchesSearch = searchTokens.every(token => searchableText.includes(token));

            if (!matchesSearch) return false;

            if (filterStatus === 'paid') return b.paymentStatus === 'paid';
            if (filterStatus === 'unpaid') return b.paymentStatus === 'unpaid';

            return true;
        });
    }, [bills, search, filterStatus]);

    const totalCollected = useMemo(() => {
        return bills
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + (Number(b.billUSD) || 0), 0);
    }, [bills]);

    // Virtualization logic
    // const GUTTER_SIZE = 24;
    // const CARD_HEIGHT = 200; // Approximate height of the bill card

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)] flex flex-col relative">
            {/* Mobile Compact Header */}
            <div className="relative block sm:hidden flex-shrink-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 pt-2">
                <div className="flex gap-2 items-center mb-3">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 border-0 rounded-xl text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm bg-white dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                        />
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>

                {/* Mobile Filter Tabs */}
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[40px]">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`flex-1 rounded-lg text-xs font-medium transition-all ${filterStatus === 'all'
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('paid')}
                        className={`flex-1 rounded-lg text-xs font-medium transition-all ${filterStatus === 'paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilterStatus('unpaid')}
                        className={`flex-1 rounded-lg text-xs font-medium transition-all ${filterStatus === 'unpaid'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Unread
                    </button>
                </div>

                {/* Mobile Menu Drawer */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl border-t border-gray-100 dark:border-gray-700 p-4 z-50 rounded-b-2xl mx-4 mt-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bill Collection</h2>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                            >
                                <Upload className="h-4 w-4" />
                                Import
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={bills.length === 0}
                                className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-3 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden sm:block flex-shrink-0 z-10 bg-gray-50 dark:bg-gray-900 mb-8">
                <div className="space-y-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bill Collection</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track payments and manage billing records</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                className="hidden"
                                accept=".xlsx, .xls"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95"
                            >
                                <Upload className="h-5 w-5" />
                                Import Bills
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={bills.length === 0}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <Download className="h-5 w-5" />
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 w-full">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    <span className="text-emerald-600 dark:text-emerald-400">$</span>
                                    {totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>

                        <div className="relative group h-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, installation, or branch..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full h-full pl-11 pr-4 py-4 border-0 rounded-2xl text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 dark:text-white dark:ring-gray-700 transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[58px]">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all'
                                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('paid')}
                                className={`px-4 rounded-lg text-sm font-medium transition-all ${filterStatus === 'paid'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Paid
                            </button>
                            <button
                                onClick={() => setFilterStatus('unpaid')}
                                className={`px-4 rounded-lg text-sm font-medium transition-all ${filterStatus === 'unpaid'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Unread
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 flex-grow">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : bills.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex-grow flex flex-col justify-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No bills found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Import an Excel file to get started.</p>
                </div>
            ) : filteredBills.length === 0 ? (
                <div className="text-center py-20 flex-grow">
                    <p className="text-lg text-gray-500 dark:text-gray-400">No results found for "{search}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredBills.map((bill) => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            onToggle={togglePayment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
