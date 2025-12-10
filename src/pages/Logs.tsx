import React, { useEffect, useState } from 'react';
import { LogRepository } from '../db/repositories';
import type { LogEntry } from '../db/types';
import { History, Clock } from 'lucide-react';

export const LogsPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const allLogs = await LogRepository.getAll();
        // Sort by timestamp descending (newest first)
        setLogs(allLogs.reverse());
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">History of actions taken</p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <History className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No activity yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Actions you take will appear here.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline vertical line */}
                        <div className="absolute top-0 bottom-0 left-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {logs.map((log) => {
                                const isPayment = log.action.toLowerCase().includes('payment') || log.action.toLowerCase().includes('paid');
                                const isUpdate = log.action.toLowerCase().includes('update');

                                return (
                                    <div key={log.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
                                        <div className="flex items-start gap-4">
                                            {/* Timeline dot */}
                                            <div className={`hidden sm:flex h-8 w-8 rounded-full items-center justify-center ring-4 ring-white dark:ring-gray-800 z-10 flex-shrink-0 ${isPayment ? 'bg-green-100 text-green-600' :
                                                    isUpdate ? 'bg-blue-100 text-blue-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                <Clock className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {log.details}
                                                    </p>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                        <Clock className="h-3 w-3 sm:hidden" />
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPayment
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : isUpdate
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
