import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Bill } from '../db/types';

interface BillCardProps {
    bill: Bill;
    onToggle: (bill: Bill) => void;
}

export const BillCard = React.memo(({ bill, onToggle }: BillCardProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 mr-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={bill.name}>
                        {bill.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {bill.branchID}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono self-center">
                            {bill.installationID}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onToggle(bill)}
                    className={`p-1.5 rounded-lg transition-colors ${bill.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}
                >
                    {bill.paymentStatus === 'paid' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                    )}
                </button>
            </div>

            <div className="flex items-end justify-between border-t border-gray-50 dark:border-gray-700/50 pt-2">
                <div>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">LBP</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {Number(bill.billLBP).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">USD</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        ${Number(bill.billUSD).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}, (prev, next) => prev.bill === next.bill);
