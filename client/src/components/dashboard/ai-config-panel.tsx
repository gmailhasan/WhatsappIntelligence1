import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Website } from "@shared/schema";
import { Worm, Trash2 } from "lucide-react";

export default function AIConfigPanel() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState("1");
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

  const handleCrawl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;

    crawlMutation.mutate({
      url: websiteUrl,
      crawlDepth: parseInt(crawlDepth),
    });
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

  return (
    <div className="space-y-6">
      {/* Website Configuration */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Website Configuration
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
          <CardTitle className="text-lg font-semibold text-gray-900">
            Crawled Websites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading websites...</div>
            ) : websites.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No websites configured yet. Add your first website above.
              </div>
            ) : (
              websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{website.url}</p>
                    <p className="text-xs text-gray-500">
                      {website.pagesIndexed} pages indexed
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
  );
}
