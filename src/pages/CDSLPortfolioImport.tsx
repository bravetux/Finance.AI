"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileInput, KeyRound, Loader2 } from "lucide-react";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { saveAs } from "file-saver";
import * as pdfjs from "pdfjs-dist";

interface Holding {
  isin: string;
  name: string;
  quantity: number;
}

const CDSLPortfolioImport: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set the workerSrc for pdf.js to ensure it works with Vite
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      showError("Please select a valid PDF file.");
      setPdfFile(null);
    }
    event.target.value = ''; // Allow re-uploading the same file
  };

  const handleImport = async () => {
    if (!pdfFile) {
      showError("Please select a PDF file to import.");
      return;
    }
    if (!password) {
      showError("Please enter the PDF password.");
      return;
    }

    setIsLoading(true);
    setHoldings([]);
    const toastId = showLoading("Reading PDF file...");

    const reader = new FileReader();
    reader.readAsArrayBuffer(pdfFile);

    reader.onload = async (e) => {
      let parsingToastId: string | number | undefined;
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error("Could not read file.");
        }

        dismissToast(toastId);
        parsingToastId = showLoading("Parsing portfolio data...");

        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
          password: password,
        });

        const pdfDoc = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          // The type for item is complex, so we cast to any to access .str
          const pageText = textContent.items.map(item => (item as any).str).join(" ");
          fullText += pageText + "\n";
        }

        const parsedHoldings: Holding[] = [];
        
        // Regex to find lines with ISIN, name, and quantity.
        const holdingRegex = /^(IN[A-Z0-9]{10})\s+(.*?)\s+([\d,]+\.\d{3})$/gm;
        
        let match;
        while ((match = holdingRegex.exec(fullText)) !== null) {
            const isin = match[1].trim();
            const name = match[2].trim().replace(/\s{2,}/g, ' ');
            const quantity = parseFloat(match[3].replace(/,/g, ''));

            if (isin && name && !isNaN(quantity)) {
                parsedHoldings.push({ isin, name, quantity });
            }
        }

        if (parsedHoldings.length === 0) {
          throw new Error("Could not find any holdings. The PDF format might be unsupported or not machine-readable.");
        }

        setHoldings(parsedHoldings);
        dismissToast(parsingToastId);
        showSuccess(`Successfully imported ${parsedHoldings.length} holdings.`);

      } catch (error: any) {
        if (parsingToastId) dismissToast(parsingToastId);
        else dismissToast(toastId);
        
        if (error.message.includes("Invalid password")) {
            showError("Incorrect password or password-protected file.");
        } else {
            showError(`Failed to parse PDF: ${error.message}`);
        }
        console.error("PDF Parsing Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      dismissToast(toastId);
      showError("Failed to read the file.");
      setIsLoading(false);
    };
  };

  const handleExport = () => {
    if (holdings.length === 0) {
      showError("No data to export.");
      return;
    }
    const dataStr = JSON.stringify(holdings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    saveAs(blob, "cdsl-portfolio.json");
    showSuccess("Portfolio data exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileInput className="h-8 w-8" />
          CDSL Portfolio Import
        </h1>
        <Button onClick={handleExport} disabled={holdings.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export JSON
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import CDSL e-CAS Statement</CardTitle>
          <CardDescription>
            Upload your password-protected CDSL e-CAS PDF to automatically extract your holdings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pdf-file">e-CAS PDF File</Label>
              <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} />
              {pdfFile && <p className="text-sm text-muted-foreground mt-1">Selected: {pdfFile.name}</p>}
            </div>
            <div>
              <Label htmlFor="pdf-password">PDF Password</Label>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="pdf-password"
                  type="password"
                  placeholder="Enter PDF password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Import Portfolio</>
            )}
          </Button>
        </CardContent>
      </Card>

      {holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Holdings</CardTitle>
            <CardDescription>
              Found {holdings.length} holdings in the provided statement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISIN</TableHead>
                    <TableHead>Security Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => (
                    <TableRow key={holding.isin}>
                      <TableCell className="font-mono">{holding.isin}</TableCell>
                      <TableCell>{holding.name}</TableCell>
                      <TableCell className="text-right">{holding.quantity.toLocaleString('en-IN', { minimumFractionDigits: 3 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CDSLPortfolioImport;