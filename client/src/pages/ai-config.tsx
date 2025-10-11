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
import { Badge } from "@/components/ui/badge";
import { Website } from "@shared/schema";
import { Worm, Trash2, Globe, Search, MessageSquare } from "lucide-react";

export default function AIConfig() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState("1");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: websites = [], isLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const crawlMutation = useMutation({
    mutationFn: async (data: { url: string; crawlDepth: number }) => {
      const response = await apiRequest("POST", "/api/websites", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setWebsiteUrl("");
      setCrawlDepth("1");
      toast({
        title: "Success",
        description: "Website crawling started successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start website crawling",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      await apiRequest("DELETE", `/api/websites/${websiteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Success",
        description: "Website removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove website",
        variant: "destructive",
      });
    },
  });

  const testAIMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/test-ai", { query });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test AI response",
        variant: "destructive",
      });
    },
  });

  const handleCrawl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;

    crawlMutation.mutate({
      url: websiteUrl,
      crawlDepth: parseInt(crawlDepth),
    });
  };

  const handleTestAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    testAIMutation.mutate(testQuery);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "crawling":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "crawling":
        return "⏳";
      case "failed":
        return "✗";
      default:
        return "⏳";
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="AI Configuration"
        subtitle="Configure AI responses and manage knowledge base"
      />

      <div className="p-8 overflow-y-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Website Configuration */}
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Website Configuration</span>
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Add websites to crawl for AI responses
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCrawl} className="space-y-4">
                  <div>
                    <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
                      Website URL
                    </Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crawlDepth" className="text-sm font-medium text-gray-700">
                      Crawl Depth
                    </Label>
                    <Select value={crawlDepth} onValueChange={setCrawlDepth}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 level</SelectItem>
                        <SelectItem value="2">2 levels</SelectItem>
                        <SelectItem value="3">3 levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-600"
                    disabled={crawlMutation.isPending || !websiteUrl.trim()}
                  >
                    <Worm className="h-4 w-4 mr-2" />
                    {crawlMutation.isPending ? "Starting Crawl..." : "Start Crawling"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Crawled Websites */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Crawled Websites</span>
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {websites.length} website{websites.length !== 1 ? 's' : ''} configured
                </p>
              </CardHeader>
              <CardContent className="max-h-[30vh] overflow-y-auto">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading websites...</div>
                  ) : websites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No websites configured yet</p>
                      <p className="text-sm">Add your first website above to get started</p>
                    </div>
                  ) : (
                    websites.map((website) => (
                      <div
                        key={website.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {getStatusIcon(website.status)}
                            </span>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {website.url}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {website.pagesIndexed} pages indexed • Depth: {website.crawlDepth}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(website.status)}>
                            {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(website.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Testing */}
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Test AI Responses</span>
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Test how AI responds to customer questions
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTestAI} className="space-y-4">
                  <div>
                    <Label htmlFor="testQuery" className="text-sm font-medium text-gray-700">
                      Customer Question
                    </Label>
                    <Textarea
                      id="testQuery"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="Enter a customer question to test AI response..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-600"
                    disabled={testAIMutation.isPending || !testQuery.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {testAIMutation.isPending ? "Testing..." : "Test AI Response"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResult && (
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    AI Response
                  </CardTitle>
                </CardHeader>
              <CardContent className="max-h-[40vh] overflow-y-auto">
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">Response:</p>
                      <p className="text-sm text-blue-800">{testResult.response.content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Confidence: {Math.round(testResult.response.confidence * 100)}%</span>
                      <span>•</span>
                      <span>Sources: {testResult.context.length}</span>
                    </div>

                    {testResult.context.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sources ({testResult.context.length}):
                        </p>
                        <div className="space-y-2">
                          {testResult.context.map((source: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {source.title}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(source.score * 100)}% match
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {source.content.substring(0, 150)}...
                              </p>
                              <p className="text-xs text-blue-600 mt-1">{source.url}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
