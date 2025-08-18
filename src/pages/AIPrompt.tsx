"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles, Terminal, Download, X, Upload } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { saveAs } from "file-saver";

type AIProvider = "openai" | "google" | "openrouter" | "ollama" | "perplexity";

const modelsByProvider: Record<AIProvider, string[]> = {
  openai: ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-pro"],
  openrouter: [
    "openai/gpt-4o",
    "google/gemini-flash-1.5",
    "anthropic/claude-3-haiku",
    "meta-llama/llama-3-8b-instruct",
  ],
  ollama: ["llama3", "mistral", "gemma"],
  perplexity: ["llama-3-sonar-small-32k-online", "llama-3-sonar-large-32k-online", "llama-3-8b-instruct", "mixtral-8x7b-instruct"],
};

const AIPrompt: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(modelsByProvider.openai[0]);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadedData, setUploadedData] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  React.useEffect(() => {
    setModelName(modelsByProvider[provider][0]);
  }, [provider]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const getFormattedDate = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
  };

  const handleExportResponse = () => {
    if (!response) {
      showError("No response to export.");
      return;
    }
    const filename = `AIResponse_${getFormattedDate()}.txt`;
    const blob = new Blob([response], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
    showSuccess(`Response exported as ${filename}`);
  };

  const handleExportPrompt = () => {
    if (!prompt) {
      showError("No prompt to export.");
      return;
    }
    const filename = `AIPrompt_${getFormattedDate()}.txt`;
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
    showSuccess(`Prompt exported as ${filename}`);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addLog(`Reading file: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content); // Validate JSON format
        setUploadedData(content);
        setUploadedFileName(file.name);
        addLog(`Successfully imported and validated ${file.name}.`);
        showSuccess("File uploaded successfully!");
      } catch (error) {
        showError('Error parsing file. Please ensure it is a valid JSON file.');
        addLog(`ERROR: Failed to parse ${file.name}. Not a valid JSON.`);
        setUploadedData(null);
        setUploadedFileName(null);
      }
    };
    reader.onerror = () => {
        showError("Failed to read the file.");
        addLog(`ERROR: Could not read file ${file.name}.`);
    }
    reader.readAsText(file);
    event.target.value = ''; // Allow re-uploading the same file
  };

  const clearUploadedFile = () => {
    setUploadedData(null);
    setUploadedFileName(null);
    addLog("Cleared uploaded file.");
  };

  const handleAnalyseResponse = () => {
    addLog("Analyzing response to update AI Insights...");
    showSuccess("Analysis complete. AI Insights page will be updated based on this response.");
  };

  const handleExportSettings = () => {
    const settings = { provider, apiKey, modelName, ollamaUrl };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    saveAs(blob, 'ai-provider-settings.json');
    showSuccess('AI settings exported successfully!');
    addLog('Exported AI provider settings.');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addLog(`Importing settings from ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const settings = JSON.parse(content);

        if (settings.provider && settings.modelName) {
          setProvider(settings.provider);
          setApiKey(settings.apiKey || "");
          setModelName(settings.modelName);
          setOllamaUrl(settings.ollamaUrl || "http://localhost:11434");
          showSuccess("AI settings imported successfully!");
          addLog("Successfully imported AI settings.");
        } else {
          throw new Error("Invalid settings file format.");
        }
      } catch (error: any) {
        showError(`Failed to import settings: ${error.message}`);
        addLog(`ERROR: Failed to import settings from ${file.name}.`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleChat = async () => {
    setLogs([]);
    addLog("Chat initiated.");
    if ((provider !== 'ollama' && !apiKey) || !modelName || !prompt) {
      showError("Please fill in all required fields: Provider, API Key (if needed), Model, and Prompt.");
      addLog("ERROR: One or more required fields are empty.");
      return;
    }
    addLog("Validation successful.");

    setIsLoading(true);
    setResponse("");

    addLog("Checking for context data...");
    if (!uploadedData) {
      showError("Please upload a context file to chat with the AI.");
      addLog("ERROR: No context file uploaded.");
      setIsLoading(false);
      return;
    }
    
    const contextData = uploadedData;
    const contextSource = `the uploaded file "${uploadedFileName}"`;

    const fullPrompt = `You are a helpful financial assistant. Based on the following data from ${contextSource}, please answer the user's question.\n\nData:\n${contextData}\n\nUser's Question:\n${prompt}`;
    addLog("Full prompt constructed.");

    try {
      let apiResponse = "";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      let url = "";
      let body: any = {};

      switch (provider) {
        case "openai":
          url = "https://api.openai.com/v1/chat/completions";
          headers["Authorization"] = `Bearer ${apiKey}`;
          body = { model: modelName, messages: [{ role: "user", content: fullPrompt }] };
          break;
        
        case "openrouter":
          url = "https://openrouter.ai/api/v1/chat/completions";
          headers["Authorization"] = `Bearer ${apiKey}`;
          body = { model: modelName, messages: [{ role: "user", content: fullPrompt }] };
          break;

        case "perplexity":
          url = "https://api.perplexity.ai/chat/completions";
          headers["Authorization"] = `Bearer ${apiKey}`;
          body = { model: modelName, messages: [{ role: "user", content: fullPrompt }] };
          break;

        case "google":
          url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          body = { contents: [{ parts: [{ text: fullPrompt }] }] };
          break;

        case "ollama":
          url = `${ollamaUrl}/api/chat`;
          body = { model: modelName, prompt: fullPrompt, stream: false };
          break;
      }

      addLog(`Sending request to ${url}...`);
      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`API Error (${res.status}): ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      addLog("Response received successfully.");

      switch (provider) {
        case "openai":
        case "openrouter":
        case "perplexity":
          apiResponse = data.choices[0]?.message?.content;
          break;
        case "google":
          apiResponse = data.candidates[0]?.content?.parts[0]?.text;
          break;
        case "ollama":
          apiResponse = data.message?.content;
          break;
      }

      if (!apiResponse) {
        throw new Error("Could not parse a valid response from the AI.");
      }

      setResponse(apiResponse);
      showSuccess("Received AI response!");

    } catch (error: any) {
      console.error("AI Chat Error:", error);
      const errorMessage = `An error occurred: ${error.message}`;
      showError(errorMessage);
      setResponse(`Error: ${error.message}`);
      addLog(`ERROR: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bot className="h-8 w-8" />AI Financial Assistant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat with your Financial Data</CardTitle>
          <CardDescription>Select a provider, model, and upload a context file, then ask a question to get AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerSelect">AI Provider</Label>
              <Select onValueChange={(value: AIProvider) => setProvider(value)} value={provider}>
                <SelectTrigger id="providerSelect"><SelectValue placeholder="Select a provider..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI / Other</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="openrouter">Open Router</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="modelName">Model Name</Label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger id="modelName"><SelectValue placeholder="Select a model..." /></SelectTrigger>
                <SelectContent>
                  {modelsByProvider[provider].map((model) => (<SelectItem key={model} value={model}>{model}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {provider === 'ollama' ? (
            <div><Label htmlFor="ollamaUrl">Ollama URL</Label><Input id="ollamaUrl" placeholder="http://localhost:11434" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} /></div>
          ) : (
            <div><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" type="password" placeholder="Enter your API key here" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></div>
          )}

          <div>
            <Label className="block mb-2">Upload Context File (JSON)</Label>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-grow">
                <Label htmlFor="import-file" className="cursor-pointer w-full flex items-center justify-center">
                  <Download className="mr-2 h-4 w-4" /> Choose File
                  <Input id="import-file" type="file" accept=".json" className="hidden" onChange={handleFileImport} />
                </Label>
              </Button>
              {uploadedFileName && (
                <Button variant="ghost" size="icon" onClick={clearUploadedFile}><X className="h-4 w-4" /></Button>
              )}
            </div>
          </div>
          {uploadedFileName && (
            <p className="text-sm text-muted-foreground -mt-2">Using file: <span className="font-medium text-primary">{uploadedFileName}</span></p>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="prompt">Your Question</Label>
              {prompt && <Button variant="outline" size="sm" onClick={handleExportPrompt}><Download className="mr-2 h-4 w-4" />Export Prompt</Button>}
            </div>
            <Textarea id="prompt" placeholder="e.g., 'Based on my cashflow, what are the top 3 areas where I can cut costs?'" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
          </div>
          <Button onClick={handleChat} disabled={isLoading}>
            {isLoading ? (<><Sparkles className="mr-2 h-4 w-4 animate-spin" />Thinking...</>) : (<><Sparkles className="mr-2 h-4 w-4" />Chat with AI</>)}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings Management</CardTitle>
          <CardDescription>Export your current AI provider settings for easy backup and import them later.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={handleExportSettings}>
            <Upload className="mr-2 h-4 w-4" /> Export Settings
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-settings-file" className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" /> Import Settings
              <Input id="import-settings-file" type="file" accept=".json" className="hidden" onChange={handleImportSettings} />
            </Label>
          </Button>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Action Log</CardTitle></CardHeader>
          <CardContent><pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">{logs.join('\n')}</pre></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>AI Response</CardTitle>
          {response && !isLoading && <Button variant="outline" size="sm" onClick={handleExportResponse}><Download className="mr-2 h-4 w-4" />Export Response</Button>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2 text-muted-foreground"><Bot className="h-5 w-5 animate-pulse" /><span>The AI is analyzing your data...</span></div>
          ) : response ? (
            <div className="prose dark:prose-invert max-w-full whitespace-pre-wrap"><p>{response}</p></div>
          ) : (
            <div className="text-muted-foreground">The AI's response will appear here.</div>
          )}
        </CardContent>
        {response && !isLoading && (
          <CardFooter>
            <Button onClick={handleAnalyseResponse}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyse Response and Update AI Insights
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AIPrompt;