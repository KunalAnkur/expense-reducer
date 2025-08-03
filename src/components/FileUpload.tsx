'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parsePdf, Transaction } from '@/lib/pdf-parser';
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onTransactionsParsed: (transactions: Transaction[]) => void;
}

export function FileUpload({ onTransactionsParsed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (fileToParse: File, pdfPassword?: string) => {
    setIsLoading(true);
    try {
      const fileBuffer = await fileToParse.arrayBuffer();
      const transactions = await parsePdf(fileBuffer, pdfPassword);
      onTransactionsParsed(transactions);
      resetState();
    } catch (error: any) {
      if (error.message === 'password') {
        setIsPasswordDialogOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to parse the PDF. Please check the file and try again.",
        });
        resetState();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!file) return;
    setIsPasswordDialogOpen(false);
    await parseFile(file, password);
  };

  const resetState = () => {
    setFile(null);
    setPassword('');
    setIsPasswordDialogOpen(false);
    const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="pdf-file">Upload PDF</Label>
        <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
      </div>
      {isLoading && <p className="mt-2 text-sm text-gray-500">Parsing PDF...</p>}

      <Dialog open={isPasswordDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetState();
        }
        setIsPasswordDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PDF Password</DialogTitle>
            <DialogDescription>
              This PDF is password protected. Please enter the password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password"className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
