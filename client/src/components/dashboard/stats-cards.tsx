import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Megaphone, Bot, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalMessages: number;
    activeCampaigns: number;
    aiResponses: number;
    responseRate: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Messages",
      value: stats.totalMessages.toLocaleString(),
      icon: MessageSquare,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
      change: "+12.5%",
      changeType: "increase" as const,
    },
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      icon: Megaphone,
      iconBg: "bg-green-50",
      iconColor: "text-success",
      change: "+8.2%",
      changeType: "increase" as const,
    },
    {
      title: "AI Responses",
      value: stats.aiResponses.toLocaleString(),
      icon: Bot,
      iconBg: "bg-purple-50",
      iconColor: "text-secondary",
      change: "+24.7%",
      changeType: "increase" as const,
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-warning",
      change: "+5.1%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-success font-medium">{card.change}</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
