import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Save } from "lucide-react";

export default function TemplateCreator() {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [enableAI, setEnableAI] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setTemplateName("");
      setCategory("");
      setContent("");
      setEnableAI(false);
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

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !category || !content.trim()) return;

    createMutation.mutate({
      name: templateName,
      category,
      content,
      enableAI,
    });
  };

  const availableVariables = ["name", "company", "phone", "email"];

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Message Templates
        </CardTitle>
        <p className="text-sm text-gray-500">
          Create and manage your WhatsApp message templates
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Creation Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-medium text-gray-700">
                  Template Name
                </Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                  Message Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your message template here..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableAI"
                  checked={enableAI}
                  onCheckedChange={setEnableAI}
                />
                <Label htmlFor="enableAI" className="text-sm text-gray-700">
                  Enable AI follow-up responses
                </Label>
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-600"
                disabled={createMutation.isPending || !templateName.trim() || !category || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </form>
          </div>

          {/* Template Preview */}
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview</h4>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 text-white rounded-full p-2">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {content || "Your message preview will appear here..."}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">✓ Delivered</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Available Variables</h4>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
