import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Search } from 'lucide-react';
import { MeterReadingCard } from '../components/MeterReadingCard';
import { useToast } from '../components/ToastProvider';
import { ReadingRepository, LogRepository } from '../db/repositories';
import { parseExcel, exportToExcel } from '../services/excel';
import type { MeterReading } from '../db/types';


export const MeterReadingPage: React.FC = () => {
    const [readings, setReadings] = useState<MeterReading[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadReadings();
    }, []);

    const loadReadings = async () => {
        setLoading(true);
        try {
            const data = await ReadingRepository.getAll();
            setReadings(data);
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
            const rawData = await parseExcel<any>(file);

            if (!rawData || rawData.length === 0) {
                throw new Error("No data found in the Excel file.");
            }

            // Map raw data to MeterReading interface with strict column mapping
            const mappedData: MeterReading[] = rawData.map((row: any) => ({
                code: String(row['Code'] ?? ''),
                installationID: String(row['Installation'] ?? ''),
                branchID: String(row['Branch'] ?? ''),
                compteur: String(row['Compteur'] ?? ''),
                inxDep: String(row['Inx-Dep'] ?? ''),
                name: String(row['Name'] ?? ''),
                usage: String(row['Usage'] ?? ''),
                seq: String(row['SEQ'] ?? ''),
                meterValue: row['Meter Values'] ? String(row['Meter Values']) : null,
                obs: String(row['OBS'] ?? ''),
                readingDate: null,
                flagged: false
            })).filter(item => item.installationID || item.name); // Basic validation

            if (mappedData.length === 0) {
                const foundColumns = Object.keys(rawData[0] || {}).join(", ");
                throw new Error(`Could not map data. Found columns: ${foundColumns}. Expected: Code, Installation, Branch, Compteur, Inx-Dep, Meter Values, Name, OBS, Usage, SEQ.`);
            }

            await ReadingRepository.addAll(mappedData);
            await loadReadings();
            showToast(`Successfully imported ${mappedData.length} readings`, 'success');
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
        const exportData = readings.map(r => ({
            'Code': r.code,
            'Installation': r.installationID,
            'Branch': r.branchID,
            'Compteur': r.compteur,
            'Inx-Dep': r.inxDep,
            'Meter Values': r.meterValue || '',
            'Name': r.name,
            'OBS': r.obs,
            'Usage': r.usage,
            'SEQ': r.seq
        }));
        exportToExcel(exportData, `readings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Readings exported successfully', 'success');
    };

    const handleUpdate = async (reading: MeterReading, field: keyof MeterReading, value: string) => {
        if (!reading.id) return;
        const updated = { ...reading, [field]: value };
        // Optimistic update
        setReadings(prev => prev.map(r => r.id === reading.id ? updated : r));
        try {
            await ReadingRepository.update(updated);

            // Log the action
            if (field === 'meterValue') {
                await LogRepository.add(
                    'Update',
                    `Meter for user "${reading.name}" was logged as "${value}"`
                );
            }

            showToast('Reading saved', 'success');
        } catch (error) {
            showToast('Failed to save reading', 'error');
            // Revert on error
            setReadings(prev => prev.map(r => r.id === reading.id ? reading : r));
        }
    };

    const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');



    const filteredReadings = React.useMemo(() => {
        return readings.filter(r => {
            // 1. Split search into individual words (tokens)
            const searchTokens = search.toLowerCase().trim().split(/\s+/);

            // 2. Create a single searchable string from the record fields
            const searchableText = `
                ${r.name} 
                ${r.code} 
                ${r.installationID} 
                ${r.branchID} 
                ${r.compteur}
            `.toLowerCase();

            // 3. Check if EVERY token exists in the searchable text
            const matchesSearch = searchTokens.every(token => searchableText.includes(token));

            if (!matchesSearch) return false;

            // Keep existing status filters
            if (filterStatus === 'read') return r.meterValue !== null && r.meterValue !== '';
            if (filterStatus === 'unread') return r.meterValue === null || r.meterValue === '';

            return true;
        });
    }, [readings, search, filterStatus]);

    // Virtualization logic
    // const GUTTER_SIZE = 24;
    // const CARD_HEIGHT = 320; // Approximate height of the card

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
                        onClick={() => setFilterStatus('read')}
                        className={`flex-1 rounded-lg text-xs font-medium transition-all ${filterStatus === 'read'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Read
                    </button>
                    <button
                        onClick={() => setFilterStatus('unread')}
                        className={`flex-1 rounded-lg text-xs font-medium transition-all ${filterStatus === 'unread'
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
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Meter Reading</h2>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{readings.length} items</span>
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
                                disabled={readings.length === 0}
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
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Meter Reading</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and record meter readings efficiently</p>
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
                                Import Data
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={readings.length === 0}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <Download className="h-5 w-5" />
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div className="relative group flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, installation, branch, or meter number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 border-0 rounded-xl text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 dark:text-white dark:ring-gray-700 transition-shadow"
                            />
                        </div>
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
                                onClick={() => setFilterStatus('read')}
                                className={`px-4 rounded-lg text-sm font-medium transition-all ${filterStatus === 'read'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Read
                            </button>
                            <button
                                onClick={() => setFilterStatus('unread')}
                                className={`px-4 rounded-lg text-sm font-medium transition-all ${filterStatus === 'unread'
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
            ) : readings.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex-grow flex flex-col justify-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No readings found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Import an Excel file to get started.</p>
                </div>
            ) : filteredReadings.length === 0 ? (
                <div className="text-center py-20 flex-grow">
                    <p className="text-lg text-gray-500 dark:text-gray-400">No results found for "{search}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredReadings.map((reading) => (
                        <MeterReadingCard
                            key={reading.id}
                            reading={reading}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


