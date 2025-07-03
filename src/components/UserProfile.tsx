
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { useAuth } from './AuthProvider';

const UserProfile = () => {
  const { signOut } = useAuth();

  return (
    <Card className="m-4 border-coffee-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-coffee-100 text-coffee-600">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-coffee-800 truncate">
              Admin User
            </p>
            <p className="text-xs text-coffee-500 truncate">
              admin@ailecoffee.com
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
