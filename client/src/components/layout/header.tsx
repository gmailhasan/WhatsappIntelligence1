import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateClick?: () => void;
  createButtonText?: string;
}

export default function Header({ 
  title, 
  subtitle, 
  onCreateClick, 
  createButtonText = "Create" 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {onCreateClick && (
            <Button onClick={onCreateClick} className="bg-primary hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          )}
          <div className="relative">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
