import React from 'react';
import { FileText, Zap, LayoutDashboard, Trash2, History } from 'lucide-react';
import { useToast } from './ToastProvider';
import { ReadingRepository, BillRepository, LogRepository } from '../db/repositories';

interface LayoutProps {
    children: React.ReactNode;
    currentMode: 'overview' | 'reading' | 'collection' | 'logs';
    onModeChange: (mode: 'overview' | 'reading' | 'collection' | 'logs') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, onModeChange }) => {
    const { showToast } = useToast();

    const handleClearData = async () => {
        if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            try {
                await ReadingRepository.clearAll();
                await BillRepository.clearAll();
                await LogRepository.clearAll(); // Also clear logs
                showToast('All data cleared successfully', 'success');

                // Force a hard reload to ensure all states are reset
                setTimeout(() => {
                    window.location.href = window.location.href;
                }, 500);
            } catch (error) {
                console.error('Failed to clear data', error);
                showToast('Failed to clear data', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onModeChange('overview')}>
                        <Zap className="h-6 w-6 text-yellow-500" />
                        <h1 className="text-xl font-bold">MeterApp</h1>
                    </div>
                    <nav className="flex gap-2 sm:gap-4">
                        <button
                            onClick={() => onModeChange('overview')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${currentMode === 'overview'
                                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </button>
                        <button
                            onClick={() => onModeChange('reading')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${currentMode === 'reading'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <Zap className="h-4 w-4" />
                            <span className="hidden sm:inline">Reading</span>
                        </button>
                        <button
                            onClick={() => onModeChange('collection')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${currentMode === 'collection'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Collection</span>
                        </button>
                        <button
                            onClick={() => onModeChange('logs')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${currentMode === 'logs'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">Logs</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <button
                            onClick={handleClearData}
                            className="px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-2"
                            title="Clear All Data"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {children}
            </main>
        </div>
    );
};
