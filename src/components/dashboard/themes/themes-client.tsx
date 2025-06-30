"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Upload, Trash2, Eye } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { uploadTheme, deleteTheme } from "@/app/actions/themes";
import type { ThemeManifest } from "@/lib/theme-utils";

interface ThemesClientProps {
  initialThemes: ThemeManifest[];
}

export function ThemesClient({ initialThemes }: ThemesClientProps) {
  const [themes, setThemes] = useState<ThemeManifest[]>(initialThemes);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [themeName, setThemeName] = useState("");
  const [selectedThemeToPreview, setSelectedThemeToPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      // Suggest theme name from file name
      setThemeName(event.target.files[0].name.replace(/\.zip$/, ""));
    } else {
      setSelectedFile(null);
      setThemeName("");
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !themeName) {
      toast.error("Please provide a theme name and select a zip file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("themeName", themeName);
    formData.append("themeFile", selectedFile);

    const result = await uploadTheme(formData);

    if (result.error) {
      toast.error("Failed to upload theme", {
        description: typeof result.error === 'string' ? result.error : "An unknown error occurred.",
      });
    } else {
      toast.success(result.message);
      // Re-fetch themes or update state directly if the action returns the new theme
      // For simplicity, we'll rely on revalidatePath in the action, so a refresh will show it.
      // For immediate UI update, we'd need to return the new theme from the action.
      // For now, we'll just close the dialog and clear form.
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setThemeName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // A full page refresh is needed to see the new theme due to server action revalidation
      window.location.reload();
    }
    setIsUploading(false);
  };

  const handleDelete = async (themeId: string) => {
    const result = await deleteTheme(themeId);
    if (result.error) {
      toast.error("Failed to delete theme", { description: result.error });
    } else {
      toast.success(result.message);
      setThemes(themes.filter(t => t.id !== themeId));
    }
  };

  const handlePreview = () => {
    if (!selectedThemeToPreview) {
      toast.error("Please select a theme to preview.");
      return;
    }
    // Construct the URL for the theme preview server
    // Assuming the theme server runs on localhost:4000 and serves 'home' template
    const previewUrl = `http://localhost:4000/preview/${selectedThemeToPreview}/theme`;
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Theme Management</CardTitle>
              <CardDescription>
                Upload, manage, and preview your custom storefront themes.
              </CardDescription>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload New Theme
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Theme Zip</DialogTitle>
                  <DialogDescription>
                    Upload a .zip file containing your Shopify-compatible theme.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUploadSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="themeName">Theme Name</Label>
                    <Input
                      id="themeName"
                      placeholder="My Awesome Theme"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="themeFile">Theme Zip File (.zip)</Label>
                    <Input
                      id="themeFile"
                      type="file"
                      accept=".zip"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload Theme
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theme Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.length > 0 ? (
                  themes.map((theme) => (
                    <TableRow key={theme.id}>
                      <TableCell className="font-medium">{theme.name}</TableCell>
                      <TableCell className="font-mono text-xs">{theme.id}</TableCell>
                      <TableCell>{new Date(theme.extractedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DeleteConfirmationDialog
                          onConfirm={() => handleDelete(theme.id)}
                          title="Delete Theme?"
                          description={`Are you sure you want to delete "${theme.name}"? This action cannot be undone.`}
                        >
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteConfirmationDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No themes uploaded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Label htmlFor="select-preview-theme">Preview Theme:</Label>
            <Select onValueChange={setSelectedThemeToPreview} value={selectedThemeToPreview || ""}>
              <SelectTrigger id="select-preview-theme" className="w-[200px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePreview} disabled={!selectedThemeToPreview}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}