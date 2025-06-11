
import { Clock, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSettingsClick?: () => void;
  onMemberClick?: () => void;
}

const Header = ({ onSettingsClick, onMemberClick }: HeaderProps) => {
  const currentTime = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-coffee-600 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Aile Coffee</h1>
          <p className="text-coffee-100 mt-1">Point of Sale System</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-coffee-100">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{currentTime}</span>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onMemberClick}
            className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
          >
            <User className="w-4 h-4 mr-2" />
            สมาชิก
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onSettingsClick}
            className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
