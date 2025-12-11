import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { MeterReading } from '../db/types';

interface MeterReadingCardProps {
    reading: MeterReading;
    onUpdate: (reading: MeterReading, field: keyof MeterReading, value: string) => void;
}

export const MeterReadingCard = React.memo(({ reading, onUpdate }: MeterReadingCardProps) => {
    const [localValue, setLocalValue] = useState(reading.meterValue || '');

    useEffect(() => {
        setLocalValue(reading.meterValue || '');
    }, [reading.meterValue]);

    const handleBlur = () => {
        if (localValue !== (reading.meterValue || '')) {
            onUpdate(reading, 'meterValue', localValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1 mr-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={reading.name}>
                        {reading.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {reading.branchID}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono self-center">
                            #{reading.compteur}
                        </span>
                    </div>
                </div>
                {reading.meterValue ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
            </div>

            <div className="space-y-2">
                <div>
                    <input
                        type="number"
                        inputMode="decimal"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Reading..."
                        className="block w-full rounded-lg border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm sm:leading-6 bg-gray-50 dark:bg-gray-900 dark:text-white dark:ring-gray-700 font-mono"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={reading.obs || ''}
                        onChange={(e) => onUpdate(reading, 'obs', e.target.value)}
                        placeholder="Notes..."
                        className="block w-full rounded-lg border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs sm:leading-6 bg-gray-50 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                    />
                </div>
            </div>
        </div>
    );
}, (prev, next) => prev.reading === next.reading);
