import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Upload, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MigrationsPage() {
  const [exportedData, setExportedData] = useState<any[] | null>(null);
  const [importData, setImportData] = useState<string>("");
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportMaterials = useAction(api.migrations.learningMaterialsMigration.exportLearningMaterials);
  const importMaterials = useMutation(api.migrations.learningMaterialsMigration.importLearningMaterials);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportMaterials();
      setExportedData(data);
      
      // Download as file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "learning-materials-export.json";
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
      setImportResult({
        success: false,
        message: `Export failed: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      let dataToImport;
      try {
        dataToImport = JSON.parse(importData);
        if (!Array.isArray(dataToImport)) {
          throw new Error("Imported data must be an array");
        }
      } catch (e) {
        throw new Error("Invalid JSON format");
      }

      const result = await importMaterials({ materials: dataToImport });
      setImportResult({
        success: true,
        message: `Successfully imported ${result.count} learning materials`
      });
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        success: false,
        message: `Import failed: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Learning Materials Migration</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Card */}
          <Card>
            <CardHeader>
              <CardTitle>Export Learning Materials</CardTitle>
              <CardDescription>
                Export all learning materials from this environment to import into another environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Materials
                  </>
                )}
              </Button>
              
              {exportedData && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Exported {exportedData.length} learning materials
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Card */}
          <Card>
            <CardHeader>
              <CardTitle>Import Learning Materials</CardTitle>
              <CardDescription>
                Import learning materials from a JSON file or paste the JSON data below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                />
              </div>
              
              <Textarea
                placeholder="Paste JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="min-h-[200px]"
              />
              
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !importData}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Materials
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result Alert */}
        {importResult && (
          <Alert className={`mt-6 ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {importResult.success ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>
              {importResult.success ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {importResult.message}
            </AlertDescription>
          </Alert>
        )}
      </main>
      <Footer />
    </div>
  );
} 