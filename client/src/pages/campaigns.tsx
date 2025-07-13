import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import CampaignModal from "@/components/modals/campaign-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2, Play, Pause, Send } from "lucide-react";

export default function Campaigns() {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/send`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign messages sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send campaign messages",
        variant: "destructive",
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Campaign> }) => {
      const response = await apiRequest("PUT", `/api/campaigns/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      await apiRequest("DELETE", `/api/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusToggle = (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaignMutation.mutate({
      id: campaign.id,
      updates: { status: newStatus },
    });
  };

  const handleSendCampaign = (campaignId: number) => {
    sendCampaignMutation.mutate(campaignId);
  };

  const handleDeleteCampaign = (campaignId: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Campaigns"
        subtitle="Manage your WhatsApp message campaigns"
        onCreateClick={() => setShowCampaignModal(true)}
        createButtonText="New Campaign"
      />

      <div className="p-8 overflow-y-auto h-full">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              All Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No campaigns found. Create your first campaign to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
                          {campaign.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(campaign)}
                          disabled={updateCampaignMutation.isPending}
                        >
                          {campaign.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={sendCampaignMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          disabled={deleteCampaignMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Template ID</p>
                        <p className="font-medium">{campaign.templateId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Recipients</p>
                        <p className="font-medium">
                          {(campaign.phoneNumbers as string[]).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Messages Sent</p>
                        <p className="font-medium">{campaign.messagesSent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Responses</p>
                        <p className="font-medium">{campaign.responsesReceived.toLocaleString()}</p>
                      </div>
                    </div>

                    {campaign.scheduledFor && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Scheduled for: {format(new Date(campaign.scheduledFor), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
      />
    </div>
  );
}
