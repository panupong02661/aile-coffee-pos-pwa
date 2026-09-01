import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  customer_id: string;
  customer_name?: string;
  order_id: string;
  rating: number;
  comment: string;
  response: string;
  response_by: string;
  response_at: string;
  is_public: boolean;
  created_at: string;
}

const ReviewManagement = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          members:customer_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsWithCustomer = data?.map(review => ({
        ...review,
        customer_name: (review as any).members?.name || 'ลูกค้า',
      })) || [];

      setReviews(reviewsWithCustomer);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลรีวิวได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSaveResponse = async (reviewId: string) => {
    try {
      const response = responseText[reviewId];
      if (!response?.trim()) {
        toast({
          title: 'กรุณากรอกข้อความ',
          description: 'กรุณากรอกคำตอบกลับ',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .update({
          response,
          response_by: 'Admin',
          response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({ title: 'ตอบกลับสำเร็จ ✅' });
      setResponseText(prev => ({ ...prev, [reviewId]: '' }));
      loadReviews();
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกคำตอบได้',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? ((reviews.filter(r => r.rating === rating).length / reviews.length) * 100).toFixed(0)
      : '0',
  }));

  return (
    <div className="h-screen bg-background flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto mt-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                จัดการรีวิวและฟีดแบ็ค
              </h1>
              <p className="text-gray-600 mt-2">รวบรวมและตอบกลับความคิดเห็นจากลูกค้า</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                    <Star className="w-8 h-8 fill-yellow-400" />
                    {averageRating}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">จาก {reviews.length} รีวิว</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">รอตอบกลับ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {reviews.filter(r => !r.response).length}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">รีวิวที่ยังไม่ได้ตอบ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">ความพึงพอใจ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                    <TrendingUp className="w-8 h-8" />
                    {reviews.filter(r => r.rating >= 4).length > 0 
                      ? ((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100).toFixed(0)
                      : '0'}%
                  </div>
                  <p className="text-sm text-gray-500 mt-1">รีวิว 4-5 ดาว</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>การกระจายคะแนน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={filterRating === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterRating('all')}
                    size="sm"
                  >
                    ทั้งหมด
                  </Button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Button
                      key={rating}
                      variant={filterRating === rating ? 'default' : 'outline'}
                      onClick={() => setFilterRating(rating)}
                      size="sm"
                    >
                      {rating} <Star className="w-3 h-3 ml-1 fill-current" />
                    </Button>
                  ))}
                </div>

                {isLoading ? (
                  <Card>
                    <CardContent className="py-8 text-center">กำลังโหลด...</CardContent>
                  </Card>
                ) : filteredReviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      ยังไม่มีรีวิว
                    </CardContent>
                  </Card>
                ) : (
                  filteredReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>{review.customer_name?.charAt(0) || 'L'}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.customer_name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{review.comment}</p>

                            {review.response ? (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                  ตอบกลับโดย {review.response_by}
                                </p>
                                <p className="text-sm text-gray-700">{review.response}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(review.response_at).toLocaleDateString('th-TH')}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="พิมพ์คำตอบกลับ..."
                                  value={responseText[review.id] || ''}
                                  onChange={(e) => setResponseText(prev => ({
                                    ...prev,
                                    [review.id]: e.target.value,
                                  }))}
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveResponse(review.id)}
                                >
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                  ตอบกลับ
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
