import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Template } from "@shared/schema";

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CampaignModal({ open, onClose }: CampaignModalProps) {
  const [campaignName, setCampaignName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [enableScheduling, setEnableScheduling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      templateId: number;
      phoneNumbers: string[];
      scheduledFor?: Date;
    }) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      resetForm();
      onClose();
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCampaignName("");
    setTemplateId("");
    setPhoneNumbers("");
    setEnableScheduling(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !templateId || !phoneNumbers.trim()) return;

    const phoneList = phoneNumbers
      .split('\n')
      .map(phone => phone.trim())
      .filter(phone => phone.length > 0);

    if (phoneList.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one phone number",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: campaignName,
      templateId: parseInt(templateId),
      phoneNumbers: phoneList,
      scheduledFor: enableScheduling ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="campaignName" className="text-sm font-medium text-gray-700">
              Campaign Name
            </Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="template" className="text-sm font-medium text-gray-700">
              Select Template
            </Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phoneNumbers" className="text-sm font-medium text-gray-700">
              Phone Numbers
            </Label>
            <Textarea
              id="phoneNumbers"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
              placeholder="Enter phone numbers (one per line)"
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableScheduling"
              checked={enableScheduling}
              onCheckedChange={setEnableScheduling}
            />
            <Label htmlFor="enableScheduling" className="text-sm text-gray-700">
              Schedule for later
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-blue-600"
              disabled={createMutation.isPending || !campaignName.trim() || !templateId || !phoneNumbers.trim()}
            >
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
