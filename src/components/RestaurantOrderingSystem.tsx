
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Bell, Settings, User, Store, Plus, Minus, Clock, CheckCircle, X, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

const RestaurantOrderingSystem = () => {
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'restaurant'
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('bell');
  const [customSound, setCustomSound] = useState(null);
  const [volume, setVolume] = useState(0.8); // เพิ่มการควบคุมระดับเสียง
  const audioRef = useRef(null);

  // Menu items
  const menuItems = [
    { id: 1, name: 'ผัดไทย', price: 60, category: 'อาหารจานหลัก', image: '🍜', description: 'ผัดไทยกุ้งสด รสชาติแท้' },
    { id: 2, name: 'ต้มยำกุ้ง', price: 120, category: 'ซุป', image: '🍲', description: 'ต้มยำกุ้งน้ำใส รสจัดจ้าน' },
    { id: 3, name: 'ข้าวผัดปู', price: 80, category: 'อาหารจานหลัก', image: '🍚', description: 'ข้าวผัดปูไข่ข้น หอมๆ' },
    { id: 4, name: 'ส้มตำไทย', price: 45, category: 'ยำ', image: '🥗', description: 'ส้มตำไทยรสแซ่บ' },
    { id: 5, name: 'แกงเขียวหวานไก่', price: 90, category: 'แกง', image: '🍛', description: 'แกงเขียวหวานไก่ใส่มะเขือ' },
    { id: 6, name: 'ไก่ย่าง', price: 150, category: 'ย่าง/ปิ้ง', image: '🍗', description: 'ไก่ย่างสุกใหม่ๆ' },
    { id: 7, name: 'ชาไทย', price: 25, category: 'เครื่องดื่ม', image: '🧋', description: 'ชาไทยเข้มข้น หวานมัน' },
    { id: 8, name: 'น้ำส้มคั้น', price: 35, category: 'เครื่องดื่ม', image: '🍊', description: 'น้ำส้มคั้นสด 100%' },
    { id: 9, name: 'ขนมหวาน', price: 40, category: 'ของหวาน', image: '🍮', description: 'ฟักทองกวนใส่มะพร้าว' },
    { id: 10, name: 'ลาบหมู', price: 70, category: 'ยำ', image: '🥩', description: 'ลาบหมูใส่มิ้นต์สด' }
  ];

  const categories = [...new Set(menuItems.map(item => item.category))];

  // Sound options
  const soundOptions = [
    { id: 'bell', name: 'ระฆัง', frequency: 800 },
    { id: 'chime', name: 'กิ่งแก้ว', frequency: 1000 },
    { id: 'notification', name: 'แจ้งเตือน', frequency: 600 },
    { id: 'alert', name: 'ปลุก', frequency: 1200 },
    { id: 'custom', name: 'เพลงกำหนดเอง', frequency: null }
  ];

  // Play notification sound - ปรับปรุงให้เล่นเสียงดังขึ้น
  const playNotificationSound = async () => {
    if (!soundEnabled) return;

    try {
      if (selectedSound === 'custom' && customSound) {
        // หยุดเสียงเก่าก่อน (ถ้ามี)
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        // สร้างและเล่นเสียงใหม่
        const audio = new Audio(customSound);
        audioRef.current = audio;
        
        // ตั้งค่าระดับเสียงให้ดัง
        audio.volume = Math.min(volume, 1.0); // ใช้ระดับเสียงที่ตั้งไว้
        
        // เพิ่ม event listeners
        audio.addEventListener('canplaythrough', () => {
          console.log('เสียงพร้อมเล่น');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('ไม่สามารถเล่นเสียงได้:', e);
        });

        // เล่นเสียง
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('เล่นเสียงสำเร็จ');
            })
            .catch(error => {
              console.log('ต้องอนุญาตให้เล่นเสียงก่อน:', error);
            });
        }
        
      } else {
        // เล่นเสียง Tone.js
        await Tone.start();
        const sound = soundOptions.find(s => s.id === selectedSound);
        if (sound && sound.frequency) {
          // สร้าง synth พร้อมความดังที่เพิ่มขึ้น
          const synth = new Tone.Synth({
            oscillator: {
              type: "sine"
            },
            envelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.8,
              release: 0.5
            }
          }).toDestination();
          
          // ตั้งระดับเสียง
          synth.volume.value = Tone.gainToDb(volume);
          
          synth.triggerAttackRelease(sound.frequency, '0.5n');
          
          // เพิ่มจังหวะสำหรับระฆัง
          if (selectedSound === 'bell') {
            setTimeout(() => synth.triggerAttackRelease(sound.frequency, '0.3n'), 300);
            setTimeout(() => synth.triggerAttackRelease(sound.frequency, '0.2n'), 600);
          }
        }
      }
    } catch (error) {
      console.log('เสียงไม่สามารถเล่นได้:', error);
    }
  };

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    } else {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    }
  };

  // Calculate total
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Submit order
  const submitOrder = () => {
    if (cart.length === 0 || !customerInfo.name || !customerInfo.phone) {
      alert('กรุณากรอกข้อมูลและเลือกอาหารให้ครบถ้วน');
      return;
    }

    const newOrder = {
      id: Date.now(),
      items: [...cart],
      customer: { ...customerInfo },
      total: getTotal(),
      status: 'รอดำเนินการ',
      timestamp: new Date().toLocaleString('th-TH'),
      orderNumber: `#${Math.floor(Math.random() * 9000) + 1000}`
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setNewOrderAlert(true);
    playNotificationSound();

    // Hide alert after 5 seconds
    setTimeout(() => setNewOrderAlert(false), 5000);

    alert('สั่งอาหารสำเร็จ! ขอบคุณครับ');
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Handle custom sound upload - ปรับปรุงให้รองรับไฟล์เพลง
  const handleCustomSoundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
      
      if (allowedTypes.includes(file.type)) {
        const url = URL.createObjectURL(file);
        setCustomSound(url);
        setSelectedSound('custom');
        
        // แสดงชื่อไฟล์
        console.log('อัปโหลดไฟล์เสียง:', file.name);
      } else {
        alert('กรุณาเลือกไฟล์เสียงเท่านั้น (MP3, WAV, OGG, M4A, AAC)');
      }
    }
  };

  // Test sound
  const testSound = () => {
    playNotificationSound();
  };

  // Customer View
  const CustomerView = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🍽️</div>
              <h1 className="text-2xl font-bold text-gray-800">ร้านอาหารออนไลน์</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCurrentView('restaurant')}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Store className="h-5 w-5" />
                <span>หน้าร้านค้า</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">เมนูอาหาร</h2>
            
            {categories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-orange-200 pb-2">
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {menuItems.filter(item => item.category === category).map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">{item.image}</div>
                          <span className="text-2xl font-bold text-orange-600">฿{item.price}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h4>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>เพิ่มลงตะกร้า</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                ตะกร้าสินค้า
              </h3>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-orange-600 font-semibold">฿{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-green-100 text-green-600 p-1 rounded hover:bg-green-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>รวมทั้งหมด:</span>
                      <span className="text-orange-600">฿{getTotal()}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-800">ข้อมูลลูกค้า</h4>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="เบอร์โทรศัพท์"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="ที่อยู่จัดส่ง"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent h-20"
                    />
                  </div>

                  <button
                    onClick={submitOrder}
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
                  >
                    สั่งอาหาร
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Restaurant View
  const RestaurantView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏪</div>
              <h1 className="text-2xl font-bold text-gray-800">หน้าร้านค้า - จัดการออเดอร์</h1>
            </div>
            <div className="flex items-center space-x-4">
              {newOrderAlert && (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg animate-pulse">
                  <Bell className="h-5 w-5" />
                  <span>ออเดอร์ใหม่!</span>
                </div>
              )}
              <button
                onClick={() => setCurrentView('customer')}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>หน้าลูกค้า</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">รายการออเดอร์</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">ยังไม่มีออเดอร์</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{order.orderNumber}</h3>
                        <p className="text-gray-600">{order.timestamp}</p>
                        <p className="text-gray-600">
                          <strong>ลูกค้า:</strong> {order.customer.name} ({order.customer.phone})
                        </p>
                        {order.customer.address && (
                          <p className="text-gray-600">
                            <strong>ที่อยู่:</strong> {order.customer.address}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'รอดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'กำลังทำ' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'พร้อมส่ง' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">฿{order.total}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">รายการอาหาร:</h4>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <span>{item.name} x{item.quantity}</span>
                            <span className="font-semibold">฿{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'กำลังทำ')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        กำลังทำ
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'พร้อมส่ง')}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        พร้อมส่ง
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'เสร็จสิ้น')}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                      >
                        เสร็จสิ้น
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                ตั้งค่าเสียงแจ้งเตือน
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">เปิด/ปิดเสียง</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </button>
                </div>

                {/* เพิ่มการควบคุมระดับเสียง */}
                <div>
                  <label className="block text-gray-700 mb-2">ระดับเสียง: {Math.round(volume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">เลือกเสียงแจ้งเตือน:</label>
                  <select
                    value={selectedSound}
                    onChange={(e) => setSelectedSound(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {soundOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSound === 'custom' && (
                  <div>
                    <label className="block text-gray-700 mb-2">อัปโหลดไฟล์เพลง:</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleCustomSoundUpload}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">รองรับ: MP3, WAV, OGG, M4A, AAC</p>
                  </div>
                )}

                <button
                  onClick={testSound}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔊 ทดสอบเสียง
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">สถิติวันนี้</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ออเดอร์ทั้งหมด:</span>
                    <span className="font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ยอดขายรวม:</span>
                    <span className="font-semibold text-green-600">
                      ฿{orders.reduce((sum, order) => sum + order.total, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ออเดอร์ที่เสร็จ:</span>
                    <span className="font-semibold text-blue-600">
                      {orders.filter(order => order.status === 'เสร็จสิ้น').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return currentView === 'customer' ? <CustomerView /> : <RestaurantView />;
};

export default RestaurantOrderingSystem;
