import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign, Website, Template, Conversation } from "@shared/schema";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Megaphone, 
  Bot, 
  TrendingUp, 
  Globe,
  FileText,
  MessageCircle,
  Users,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function Analytics() {
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

  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate analytics
  const totalCampaigns = campaigns.length;
  const totalWebsites = websites.length;
  const totalTemplates = templates.length;
  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const completedWebsites = websites.filter(w => w.status === 'completed').length;
  const totalPagesIndexed = websites.reduce((sum, w) => sum + w.pagesIndexed, 0);

  const campaignsByStatus = campaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const templatesByCategory = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCampaigns = campaigns
    .sort((a, b) => b.messagesSent - a.messagesSent)
    .slice(0, 5);

  const recentActivity = [
    ...campaigns.map(c => ({
      type: 'campaign',
      name: c.name,
      status: c.status,
      date: c.updatedAt,
      icon: Megaphone,
      color: 'text-blue-600'
    })),
    ...websites.map(w => ({
      type: 'website',
      name: w.url,
      status: w.status,
      date: w.updatedAt,
      icon: Globe,
      color: 'text-green-600'
    })),
    ...templates.map(t => ({
      type: 'template',
      name: t.name,
      status: 'active',
      date: t.createdAt,
      icon: FileText,
      color: 'text-purple-600'
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Analytics"
        subtitle="Monitor your WhatsApp AI platform performance"
      />

      <div className="p-8 overflow-y-auto h-full">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <Megaphone className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">AI Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aiResponses.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-full">
                  <Bot className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-full">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Campaigns</p>
                  <p className="text-xl font-bold text-gray-900">{totalCampaigns}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Websites Indexed</p>
                  <p className="text-xl font-bold text-gray-900">{completedWebsites}/{totalWebsites}</p>
                </div>
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Templates Created</p>
                  <p className="text-xl font-bold text-gray-900">{totalTemplates}</p>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Conversations</p>
                  <p className="text-xl font-bold text-gray-900">{activeConversations}</p>
                </div>
                <MessageCircle className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Campaign Performance */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Top Performing Campaigns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCampaigns.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No campaigns yet. Create your first campaign to see performance data.
                  </p>
                ) : (
                  topCampaigns.map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-xs text-gray-500">
                            {campaign.messagesSent} messages • {campaign.responsesReceived} responses
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Status Distribution */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Campaign Status Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(campaignsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} campaigns</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 w-16">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / totalCampaigns) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Categories */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Template Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(templatesByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {category.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <Badge variant="outline">{count} templates</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No recent activity to display.
                  </p>
                ) : (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2">
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.type} • {format(new Date(activity.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(activity.status)}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base Stats */}
        <Card className="border border-gray-200 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Knowledge Base Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalWebsites}</p>
                <p className="text-sm text-gray-500">Websites Added</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalPagesIndexed}</p>
                <p className="text-sm text-gray-500">Pages Indexed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{completedWebsites}</p>
                <p className="text-sm text-gray-500">Completed Crawls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
