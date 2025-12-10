import React, { useState, useEffect } from 'react';
import { PieChart, Activity, DollarSign, ArrowRight } from 'lucide-react';
import { ReadingRepository, BillRepository } from '../db/repositories';
import type { MeterReading, Bill } from '../db/types';

interface OverviewProps {
    onNavigate: (mode: 'reading' | 'collection') => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({ onNavigate }) => {
    const [readings, setReadings] = useState<MeterReading[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [readingsData, billsData] = await Promise.all([
                    ReadingRepository.getAll(),
                    BillRepository.getAll()
                ]);
                setReadings(readingsData);
                setBills(billsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Meter Reading Stats
    const totalMeters = readings.length;
    const readMeters = readings.filter(r => r.meterValue !== null && r.meterValue !== '').length;
    const readingProgress = totalMeters > 0 ? (readMeters / totalMeters) * 100 : 0;

    // Bill Collection Stats
    const totalBills = bills.length;
    const paidBills = bills.filter(b => b.paymentStatus === 'paid').length;
    const collectionProgress = totalBills > 0 ? (paidBills / totalBills) * 100 : 0;

    // Financial Stats
    const totalLBP = bills
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (Number(b.billLBP) || 0), 0);

    const totalUSD = bills
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (Number(b.billUSD) || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Dashboard Overview</h2>
                <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Meter Reading Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <button
                            onClick={() => onNavigate('reading')}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                        >
                            Go to Readings <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Meter Readings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Progress for current cycle</p>

                    <div className="mt-auto">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-700 dark:text-gray-300">{readMeters} / {totalMeters} Meters</span>
                            <span className="text-blue-600 dark:text-blue-400">{Math.round(readingProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${readingProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bill Collection Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <PieChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <button
                            onClick={() => onNavigate('collection')}
                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                        >
                            Go to Collection <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Bill Collection</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Payments collected</p>

                    <div className="mt-auto">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-700 dark:text-gray-300">{paidBills} / {totalBills} Bills</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{Math.round(collectionProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${collectionProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-white/90">Total LBP Collected</span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                        {totalLBP.toLocaleString()} <span className="text-lg font-normal text-white/70">LBP</span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-white/90">Total USD Collected</span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                        ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};
