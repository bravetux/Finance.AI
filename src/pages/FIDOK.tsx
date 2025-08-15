"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HeartHandshake, Upload, Download, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Import all the new components
import { FidokFamilyMembers } from "@/components/fidok/FidokFamilyMembers";
import { FidokImportantContacts } from "@/components/fidok/FidokImportantContacts";
import { FidokBankAccounts } from "@/components/fidok/FidokBankAccounts";
import { FidokFinancialDocuments } from "@/components/fidok/FidokFinancialDocuments";
import { FidokLockerDetails } from "@/components/fidok/FidokLockerDetails";
import { FidokOnlinePasswords } from "@/components/fidok/FidokOnlinePasswords";
import { FidokInsurancePolicies } from "@/components/fidok/FidokInsurancePolicies";
import { FidokCards } from "@/components/fidok/FidokCards";
import { FidokPropertyDetails } from "@/components/fidok/FidokPropertyDetails";
import { FidokLiabilityDetails } from "@/components/fidok/FidokLiabilityDetails";
import { FidokInvestmentAccounts } from "@/components/fidok/FidokInvestmentAccounts";

const fidokStorageKeys = [
  'fidokFamilyMembers',
  'fidokImportantContacts',
  'fidokBankAccounts',
  'fidokFinancialDocuments',
  'fidokLockerDetails',
  'fidokOnlinePasswords',
  'fidokInsurancePolicies',
  'fidokCards',
  'fidokPropertyDetails',
  'fidokLiabilityDetails',
  'fidokInvestments1',
  'fidokInvestments2',
];

const FIDOK: React.FC = () => {

  const exportData = () => {
    try {
      const allFidokData = fidokStorageKeys.reduce((acc, key) => {
        const data = localStorage.getItem(key);
        if (data) {
          acc[key] = JSON.parse(data);
        }
        return acc;
      }, {} as Record<string, any>);

      const blob = new Blob([JSON.stringify(allFidokData, null, 2)], { type: 'application/json' });
      saveAs(blob, 'fidok-data.json');
      showSuccess('FIDOK data exported successfully!');
    } catch (error) {
      showError('Failed to export data.');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let importedSomething = false;
        fidokStorageKeys.forEach(key => {
          if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            importedSomething = true;
          }
        });

        if (importedSomething) {
          showSuccess('FIDOK data imported successfully! Page will now reload.');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showError('File does not contain valid FIDOK data.');
        }
      } catch (err) {
        showError('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    fidokStorageKeys.forEach(key => localStorage.removeItem(key));
    showSuccess("All FIDOK data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HeartHandshake className="h-8 w-8" />
          FIDOK (Financial Information & Documents Of Kin)
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will clear all data on this page. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}><Upload className="mr-2 h-4 w-4" /> Export</Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Import<Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} /></Label>
          </Button>
        </div>
      </div>

      <FidokFamilyMembers />
      <FidokImportantContacts />
      <FidokBankAccounts />
      <FidokFinancialDocuments />
      <FidokLockerDetails />
      <FidokOnlinePasswords />
      <FidokInsurancePolicies />
      <FidokCards />
      <FidokPropertyDetails />
      <FidokLiabilityDetails />
      <FidokInvestmentAccounts />

    </div>
  );
};

export default FIDOK;