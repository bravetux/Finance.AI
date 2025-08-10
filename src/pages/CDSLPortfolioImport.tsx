"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileInput, KeyRound, Loader2 } from "lucide-react";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { saveAs } from "file-saver";

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
    const toastId = showLoading("Uploading and parsing statement with casparser.in...");

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("password", password);

    try {
      const response = await fetch("https://casparser.in/api/v1/parseCAS", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API Error (${response.status})`);
      }

      const parsedHoldings = data?.cas?.holdings;

      if (!parsedHoldings || !Array.isArray(parsedHoldings) || parsedHoldings.length === 0) {
        throw new Error("No holdings found in the statement, or the format is unsupported.");
      }

      setHoldings(parsedHoldings);
      dismissToast(toastId);
      showSuccess(`Successfully imported ${parsedHoldings.length} holdings.`);

    } catch (error: any) {
      dismissToast(toastId);
      showError(`Failed to parse statement: ${error.message}`);
      console.error("CAS Parser API Error:", error);
    } finally {
      setIsLoading(false);
    }
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
            Upload your password-protected CDSL e-CAS PDF to automatically extract your holdings using the casparser.in service.
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