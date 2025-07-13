import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import CampaignTable from "@/components/dashboard/campaign-table";
import AIConfigPanel from "@/components/dashboard/ai-config-panel";
import TemplateCreator from "@/components/dashboard/template-creator";
import ConversationManager from "@/components/dashboard/conversation-manager";
import CampaignModal from "@/components/modals/campaign-modal";
import { Campaign } from "@shared/schema";

export default function Dashboard() {
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const { data: stats = {
    totalMessages: 0,
    activeCampaigns: 0,
    aiResponses: 0,
    responseRate: 0,
  } } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const handleEditCampaign = (campaign: Campaign) => {
    // TODO: Implement edit campaign functionality
    console.log("Edit campaign:", campaign);
  };

  const handleDeleteCampaign = (campaignId: number) => {
    // TODO: Implement delete campaign functionality
    console.log("Delete campaign:", campaignId);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Dashboard"
        subtitle="Manage your WhatsApp campaigns and AI responses"
        onCreateClick={() => setShowCampaignModal(true)}
        createButtonText="New Campaign"
      />

      <div className="p-8 overflow-y-auto h-full">
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CampaignTable
              campaigns={campaigns}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
            />
          </div>
          <div>
            <AIConfigPanel />
          </div>
        </div>

        <div className="mb-8">
          <TemplateCreator />
        </div>

        <ConversationManager />
      </div>

      <CampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
      />
    </div>
  );
}
