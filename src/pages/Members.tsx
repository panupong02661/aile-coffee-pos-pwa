
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

const Members = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const mockMembers = [
    { id: '1', name: 'คุณสมชาย ใจดี', phone: '081-234-5678', tier: 'Gold', points: 1250, totalSpent: 15600, visits: 45 },
    { id: '2', name: 'คุณมาลี สวยใส', phone: '082-345-6789', tier: 'Gold', points: 980, totalSpent: 12400, visits: 38 },
    { id: '3', name: 'คุณสมศรี รักกาแฟ', phone: '083-456-7890', tier: 'Silver', points: 720, totalSpent: 9600, visits: 32 },
    { id: '4', name: 'คุณจิรายุ นักดื่ม', phone: '084-567-8901', tier: 'Silver', points: 640, totalSpent: 8400, visits: 28 },
    { id: '5', name: 'คุณนันทนา หวานใจ', phone: '085-678-9012', tier: 'Bronze', points: 480, totalSpent: 6200, visits: 22 }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-yellow-100 text-yellow-700';
      case 'Silver': return 'bg-gray-100 text-gray-700';
      case 'Bronze': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            title="จัดการสมาชิก"
          />

          <div className="mb-6">
            <p className="text-coffee-600 mt-2">จัดการข้อมูลสมาชิกและแต้มสะสม</p>
          </div>

          {/* Search and Add Member */}
          <Card className="border-coffee-200 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-4 h-4" />
                  <Input
                    placeholder="ค้นหาสมาชิกด้วยชื่อหรือเบอร์โทร..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-coffee-300"
                  />
                </div>
                <Button className="bg-coffee-600 hover:bg-coffee-700">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มสมาชิกใหม่
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-coffee-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-coffee-800">125</div>
                <div className="text-sm text-coffee-600">สมาชิกทั้งหมด</div>
              </CardContent>
            </Card>
            <Card className="border-coffee-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <div className="text-sm text-coffee-600">สมาชิก Gold</div>
              </CardContent>
            </Card>
            <Card className="border-coffee-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">25</div>
                <div className="text-sm text-coffee-600">สมาชิก Silver</div>
              </CardContent>
            </Card>
            <Card className="border-coffee-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">92</div>
                <div className="text-sm text-coffee-600">สมาชิก Bronze</div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <Card className="border-coffee-200">
            <CardHeader>
              <CardTitle className="text-coffee-800">รายชื่อสมาชิก</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="border border-coffee-100 rounded-lg p-4 hover:bg-coffee-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-coffee-200 rounded-full flex items-center justify-center">
                          <span className="text-coffee-600 font-semibold">
                            {member.name.charAt(2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-coffee-800">{member.name}</h3>
                          <p className="text-sm text-coffee-600">{member.phone}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(member.tier)}`}>
                              {member.tier}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-coffee-600">{member.points} แต้ม</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-coffee-800">
                          ฿{member.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-coffee-600">
                          {member.visits} ครั้ง
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Members;
