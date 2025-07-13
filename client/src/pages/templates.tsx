import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Template } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2, Save, MessageSquare } from "lucide-react";

export default function Templates() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [enableAI, setEnableAI] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      content: string;
      enableAI: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/templates", {
        ...data,
        variables: extractVariables(data.content),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      resetForm();
      setShowCreateModal(false);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      category: string;
      content: string;
      enableAI: boolean;
    }) => {
      const response = await apiRequest("PUT", `/api/templates/${data.id}`, {
        name: data.name,
        category: data.category,
        content: data.content,
        enableAI: data.enableAI,
        variables: extractVariables(data.content),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      resetForm();
      setEditingTemplate(null);
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  const resetForm = () => {
    setTemplateName("");
    setCategory("");
    setContent("");
    setEnableAI(false);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
    resetForm();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setCategory(template.category);
    setContent(template.content);
    setEnableAI(template.enableAI);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !category || !content.trim()) return;

    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        name: templateName,
        category,
        content,
        enableAI,
      });
    } else {
      createMutation.mutate({
        name: templateName,
        category,
        content,
        enableAI,
      });
    }
  };

  const handleDelete = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
    resetForm();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "welcome":
        return "bg-green-100 text-green-800";
      case "product":
        return "bg-blue-100 text-blue-800";
      case "support":
        return "bg-yellow-100 text-yellow-800";
      case "marketing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const availableVariables = ["name", "company", "phone", "email"];

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Templates"
        subtitle="Create and manage your WhatsApp message templates"
        onCreateClick={handleCreate}
        createButtonText="New Template"
      />

      <div className="p-8 overflow-y-auto h-full">
        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No templates found. Create your first template to get started.</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </Badge>
                      {template.enableAI && (
                        <Badge variant="secondary">AI Enabled</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Variables: {(template.variables as string[]).length}</span>
                        <span>Created: {format(new Date(template.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      {(template.variables as string[]).length > 0 && (
                        <div className="flex items-center space-x-2">
                          {(template.variables as string[]).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Message</SelectItem>
                    <SelectItem value="product">Product Update</SelectItem>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message template here..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableAI"
                checked={enableAI}
                onCheckedChange={setEnableAI}
              />
              <Label htmlFor="enableAI">Enable AI follow-up responses</Label>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="secondary"
                    className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                    onClick={() => setContent(prev => prev + `{{${variable}}}`)}
                  >
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !templateName.trim() || !category || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={handleCloseEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTemplateName">Template Name</Label>
                <Input
                  id="editTemplateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Message</SelectItem>
                    <SelectItem value="product">Product Update</SelectItem>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editContent">Message Content</Label>
              <Textarea
                id="editContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message template here..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editEnableAI"
                checked={enableAI}
                onCheckedChange={setEnableAI}
              />
              <Label htmlFor="editEnableAI">Enable AI follow-up responses</Label>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="secondary"
                    className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                    onClick={() => setContent(prev => prev + `{{${variable}}}`)}
                  >
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseEdit}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !templateName.trim() || !category || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Updating..." : "Update Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
