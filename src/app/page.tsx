'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Transaction } from '@/lib/pdf-parser';
import { TransactionTable } from '@/components/TransactionTable';
import { TransactionChart } from '@/components/TransactionChart';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransactionsParsed = (parsedTransactions: Transaction[]) => {
    setTransactions(parsedTransactions);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Expense Manager
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your bank statement to get started.
        </p>
      </header>
      <main className="space-y-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onTransactionsParsed={handleTransactionsParsed} />
          </CardContent>
        </Card>

        {transactions.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Expense Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionChart data={transactions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable data={transactions} />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
