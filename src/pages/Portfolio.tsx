"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Briefcase, IndianRupee, TrendingUp, Bot, Sparkles, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertContent,
  AlertDialogDescription as AlertDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle as AlertTitle,
  AlertDialogTrigger as AlertTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Holding {
  [key: string]: string | number;
}

type AIProvider = "openai" | "google" | "openrouter" | "ollama";

const modelsByProvider: Record<AIProvider, string[]> = {
  openai: ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
  google: ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-pro"],
  openrouter: [
    "openai/gpt-4o",
    "google/gemini-flash-1.5",
    "anthropic/claude-3-haiku",
    "meta-llama/llama-3-8b-instruct",
  ],
  ollama: ["llama3", "mistral", "gemma"],
};

const Portfolio: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<{ holdings: Holding[], headers: string[] }>(() => {
    try {
      const savedData = localStorage.getItem('portfolioData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to load portfolio data from localStorage:", error);
    }
    return { holdings: [], headers: [] };
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(modelsByProvider.openai[0]);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");

  const { holdings, headers } = portfolioData;

  useEffect(() => {
    try {
      localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    } catch (error) {
      console.error("Failed to save portfolio data to localStorage:", error);
    }
  }, [portfolioData]);
  
  useEffect(() => {
    setModelName(modelsByProvider[provider][0]);
  }, [provider]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showError("No file selected.");
      return;
    }

    if (file.type !== "text/csv") {
      showError("Please upload a valid CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          showError("Error parsing CSV file.");
          console.error("CSV Parsing Errors:", results.errors);
          return;
        }
        
        const parsedData = results.data as Holding[];
        const numericHeaders = ["quantity", "avg_cost", "ltp", "cur_val", "pnl"];

        const processedData = parsedData.map(row => {
            const newRow: Holding = {};
            for (const key in row) {
                const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                if (numericHeaders.includes(lowerKey)) {
                    newRow[key] = parseFloat(String(row[key]).replace(/,/g, '')) || 0;
                } else {
                    newRow[key] = row[key] as string;
                }
            }
            return newRow;
        });

        const newHeaders = Object.keys(processedData[0] || {});
        setPortfolioData({ holdings: processedData, headers: newHeaders });
        setAnalysisResults({}); // Clear old analysis on new import
        showSuccess("Holding statement imported successfully!");
      },
      error: (error) => {
        showError("Failed to parse the file.");
        console.error("PapaParse Error:", error);
      },
    });

    event.target.value = '';
  };

  const handleAnalyze = async () => {
    if ((provider !== 'ollama' && !apiKey) || !modelName) {
      showError("Please select a provider, model, and provide an API key (if required).");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResults({});

    const instrumentKey = headers.find(h => h.toLowerCase().includes('instrument') || h.toLowerCase().includes('symbol'));
    if (!instrumentKey) {
      showError("Could not find an 'instrument' or 'symbol' column in your data.");
      setIsAnalyzing(false);
      return;
    }

    const promptData = holdings.map(h => ({ ...h }));
    const prompt = `You are a financial analyst. For each of the following stocks in this portfolio, provide a brief analysis (max 20 words) on whether it is a 'good buy', 'hold', or 'sell' candidate based on the provided data. Provide the analysis in a JSON array format, where each object has an "instrument" key (matching the input's instrument/symbol column) and an "analysis" key.

Portfolio Data:
${JSON.stringify(promptData, null, 2)}

Your response should be ONLY the JSON array of objects. Do not include any other text or markdown formatting. Example: [{"instrument": "RELIANCE", "analysis": "Strong fundamentals, hold for long term."}]`;

    try {
      let apiResponseText: string | undefined;
      const reqHeaders: HeadersInit = { "Content-Type": "application/json" };
      let url = "";
      let body: any = {};

      switch (provider) {
        case "openai":
          url = "https://api.openai.com/v1/chat/completions";
          reqHeaders["Authorization"] = `Bearer ${apiKey}`;
          body = { model: modelName, messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } };
          break;
        case "openrouter":
          url = "https://openrouter.ai/api/v1/chat/completions";
          reqHeaders["Authorization"] = `Bearer ${apiKey}`;
          body = { model: modelName, messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } };
          break;
        case "google":
          url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          body = { contents: [{ parts: [{ text: prompt }] }] };
          break;
        case "ollama":
          url = `${ollamaUrl}/api/chat`;
          body = { model: modelName, prompt: prompt, stream: false, format: "json" };
          break;
      }

      const res = await fetch(url, { method: "POST", headers: reqHeaders, body: JSON.stringify(body) });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`API Error (${res.status}): ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const data = await res.json();

      switch (provider) {
        case "openai":
        case "openrouter":
          apiResponseText = data.choices[0]?.message?.content;
          break;
        case "google":
          apiResponseText = data.candidates[0]?.content?.parts[0]?.text;
          break;
        case "ollama":
          apiResponseText = data.message?.content;
          break;
      }

      if (!apiResponseText) throw new Error("AI response was empty or invalid.");
      
      // The AI might return a JSON string that contains another stringified JSON. We need to parse it twice.
      const parsedResponse = JSON.parse(apiResponseText);
      const finalAnalysis = Array.isArray(parsedResponse) ? parsedResponse : JSON.parse(parsedResponse);

      const resultsMap: Record<string, string> = {};
      finalAnalysis.forEach((item: any) => {
        const instrumentValue = item[instrumentKey] || item.instrument || item.symbol;
        if (instrumentValue) {
          resultsMap[instrumentValue] = item.analysis;
        }
      });

      setAnalysisResults(resultsMap);
      showSuccess("Portfolio analysis complete!");
    } catch (error: any) {
      showError(`Analysis failed: ${error.message}`);
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
      setIsDialogOpen(false);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('portfolioData');
    showSuccess("Portfolio data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const portfolioSummary = useMemo(() => {
    if (holdings.length === 0) return { totalInvestment: 0, currentValue: 0, overallPnl: 0 };
    let totalInvestment = 0, currentValue = 0;
    const qtyKey = headers.find(k => k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'));
    const avgCostKey = headers.find(k => k.toLowerCase().includes('avg') && k.toLowerCase().includes('cost'));
    const curValKey = headers.find(k => k.toLowerCase().includes('cur') && k.toLowerCase().includes('val'));
    if (!qtyKey || !avgCostKey || !curValKey) return { totalInvestment: 0, currentValue: 0, overallPnl: 0 };
    holdings.forEach(h => {
      totalInvestment += (Number(h[qtyKey]) || 0) * (Number(h[avgCostKey]) || 0);
      currentValue += Number(h[curValKey]) || 0;
    });
    return { totalInvestment, currentValue, overallPnl: currentValue - totalInvestment };
  }, [holdings, headers]);

  const instrumentKey = headers.find(h => h.toLowerCase().includes('instrument') || h.toLowerCase().includes('symbol'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Briefcase className="h-8 w-8" />Portfolio Analysis</h1>
        <div className="flex gap-2">
          <AlertTrigger asChild>
            <Button variant="destructive" disabled={holdings.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear Data
            </Button>
          </AlertTrigger>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={holdings.length === 0}>
                <Bot className="mr-2 h-4 w-4" /> Analyze with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Analysis Configuration</DialogTitle>
                <DialogDescription>Choose your AI provider and enter your credentials to analyze the portfolio.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="providerSelect">AI Provider</Label>
                    <Select onValueChange={(v: AIProvider) => setProvider(v)} value={provider}>
                      <SelectTrigger id="providerSelect"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI / Other</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="openrouter">Open Router</SelectItem>
                        <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modelName">Model Name</Label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger id="modelName"><SelectValue /></SelectTrigger>
                      <SelectContent>{modelsByProvider[provider].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {provider === 'ollama' ? (
                  <div><Label htmlFor="ollamaUrl">Ollama URL</Label><Input id="ollamaUrl" value={ollamaUrl} onChange={e => setOllamaUrl(e.target.value)} /></div>
                ) : (
                  <div><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} /></div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? <><Sparkles className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Run Analysis"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Import CSV<Input id="import-file" type="file" accept=".csv" className="hidden" onChange={handleFileImport} /></Label>
          </Button>
          <AlertContent>
            <AlertHeader>
              <AlertTitle>Are you sure?</AlertTitle>
              <AlertDescription>
                This will clear all imported portfolio data from this page. This action cannot be undone.
              </AlertDescription>
            </AlertHeader>
            <AlertFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData}>
                Yes, clear data
              </AlertDialogAction>
            </AlertFooter>
          </AlertContent>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Investment</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{portfolioSummary.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Current Value</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{portfolioSummary.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Overall P&L</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${portfolioSummary.overallPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{portfolioSummary.overallPnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Holdings</CardTitle><CardDescription>{holdings.length > 0 ? "Your imported portfolio holdings." : "Import a CSV file to see your portfolio holdings here."}</CardDescription></CardHeader>
        <CardContent>
          {holdings.length > 0 ? (
            <div className="overflow-x-auto"><Table><TableHeader><TableRow>{headers.map(h => <TableHead key={h} className="capitalize">{h.replace(/_/g, ' ')}</TableHead>)}{(isAnalyzing || Object.keys(analysisResults).length > 0) && <TableHead>AI Analysis</TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {holdings.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map(h => <TableCell key={`${rowIndex}-${h}`}>{typeof row[h] === 'number' ? (row[h] as number).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : row[h]}</TableCell>)}
                      {(isAnalyzing || Object.keys(analysisResults).length > 0) && (
                        <TableCell>
                          {isAnalyzing ? <Skeleton className="h-4 w-full" /> : (instrumentKey && analysisResults[row[instrumentKey] as string]) || ''}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No holdings to display.</p><p>Please import your holding statement.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;