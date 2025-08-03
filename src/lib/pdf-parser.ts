import * as pdfjs from 'pdfjs-dist/build/pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

export interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
}

export async function parsePdf(fileBuffer: ArrayBuffer, password?: string): Promise<Transaction[]> {
  const loadingTask = pdfjs.getDocument({ data: fileBuffer, password });

  try {
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
      fullText += pageText + '\n';
    }

    const parsedTransactions = parseTransactionsFromText(fullText);
    return parsedTransactions;

  } catch (error: any) {
    if (error.name === 'PasswordException') {
      throw new Error('password');
    } else {
      console.error('Error parsing PDF:', error);
      throw new Error('parsing_failed');
    }
  }
}

function parseTransactionsFromText(text: string): Transaction[] {
    const transactions: Transaction[] = [];
    const lines = text.split('\n');

    // This regex is very optimistic. It assumes a structure of:
    // DATE (dd/mm/yyyy) | DESCRIPTION (any chars) | AMOUNT (can be debit or credit)
    const transactionRegex = /(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+((?:-)?[\d,]+\.\d{2})/g;

    for (const line of lines) {
        const matches = [...line.matchAll(transactionRegex)];
        for (const match of matches) {
            const date = match[1];
            const description = match[2].trim();
            const amountStr = match[3].replace(/,/g, '');
            const amount = parseFloat(amountStr);

            if (description && !isNaN(amount)) {
                transactions.push({
                    date,
                    description,
                    debit: amount < 0 ? Math.abs(amount) : null,
                    credit: amount > 0 ? amount : null,
                });
            }
        }
    }
    return transactions;
}
