import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import type { MeterReading } from '../db/types';

interface MeterReadingCardProps {
    reading: MeterReading;
    onUpdate: (reading: MeterReading, field: keyof MeterReading, value: string) => void;
}

export const MeterReadingCard = React.memo(({ reading, onUpdate }: MeterReadingCardProps) => {
    const [localValue, setLocalValue] = useState(reading.meterValue || '');
    const [isEditing, setIsEditing] = useState(!reading.meterValue);
    const [shouldFocus, setShouldFocus] = useState(false);

    useEffect(() => {
        setLocalValue(reading.meterValue || '');
        // If we have a value, we are not editing. If we don't, we are editing.
        setIsEditing(!reading.meterValue);
        // Reset focus state when reading changes
        setShouldFocus(false);
    }, [reading.meterValue]);

    const handleBlur = () => {
        if (localValue !== (reading.meterValue || '')) {
            onUpdate(reading, 'meterValue', localValue);
        }
        // Only exit edit mode if we have a value
        if (localValue) {
            setIsEditing(false);
        }
        setShouldFocus(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setShouldFocus(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1 mr-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate mb-1" title={reading.name}>
                        {reading.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-400 dark:text-gray-500">Br:</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300">{reading.branchID}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-400 dark:text-gray-500">Inst:</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300">{reading.installationID}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-400 dark:text-gray-500">Mtr:</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300">{reading.compteur}</span>
                        </span>
                    </div>
                </div>
                {reading.meterValue ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                            Old Index
                        </label>
                        <div className="block w-full rounded-lg border-0 py-2 px-3 text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 font-mono text-sm font-medium">
                            {reading.inxDep || '-'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
                            New Index
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                inputMode="decimal"
                                enterKeyHint="done"
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter reading"
                                autoFocus={shouldFocus}
                                className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm font-mono font-medium bg-white dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                            />
                        ) : (
                            <div className="relative flex items-center">
                                <div
                                    onClick={handleEditClick}
                                    className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white text-sm font-mono font-medium cursor-pointer hover:ring-blue-400 transition-all"
                                >
                                    {localValue}
                                </div>
                                <button
                                    onClick={handleEditClick}
                                    className="absolute right-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Edit reading"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => prev.reading === next.reading);
