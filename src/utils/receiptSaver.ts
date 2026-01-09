import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import html2canvas from 'html2canvas';

interface ReceiptData {
  shopLogoUrl?: string;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  taxId?: string;
  orderNumber: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    addons?: Array<{ name: string; price: number }>;
    item_discount?: number;
    item_discount_type?: string;
  }>;
  subtotal: number;
  billDiscount?: number;
  itemDiscountTotal?: number;
  totalAmount: number;
  paymentMethod: string;
  memberName?: string;
  memberPhone?: string;
  wifiVoucher?: {
    username: string;
    password: string;
    qr_code_url?: string | null;
  } | null;
  footerMessage?: string;
}

// Preload image for html2canvas
const preloadImage = async (imageUrl: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = imageUrl + '?t=' + Date.now();
    setTimeout(() => resolve(), 3000);
  });
};

// Create receipt HTML element
const createReceiptElement = (data: ReceiptData): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: -9999px;
    background: white;
    font-family: monospace;
    font-size: 12px;
    padding: 16px;
    width: 300px;
    color: black;
  `;

  const formatPrice = (price: number) => price.toLocaleString();
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');
  };

  let html = '';

  // Logo
  if (data.shopLogoUrl) {
    html += `<div style="text-align: center; margin-bottom: 12px;">
      <img src="${data.shopLogoUrl}?t=${Date.now()}" crossorigin="anonymous" style="width: 56px; height: 56px; object-fit: contain;" />
    </div>`;
  }

  // Shop info
  if (data.shopName) {
    html += `<div style="text-align: center; margin-bottom: 12px;">
      <div style="font-weight: bold; font-size: 16px;">${data.shopName}</div>
      ${data.shopAddress ? `<div style="font-size: 10px; margin-top: 4px;">${data.shopAddress}</div>` : ''}
      ${data.shopPhone ? `<div style="font-size: 10px;">โทร: ${data.shopPhone}</div>` : ''}
    </div>`;
  }

  // Tax ID
  if (data.taxId) {
    html += `<div style="text-align: center; font-size: 10px; margin-bottom: 12px;">
      เลขประจำตัวผู้เสียภาษี: ${data.taxId}
    </div>`;
  }

  html += `<hr style="border: 1px dashed #ccc; margin: 12px 0;" />`;

  // Date and order number
  html += `<div style="font-size: 10px; margin-bottom: 4px;">
    วันที่: ${formatDateTime(data.orderDate)}
  </div>`;
  html += `<div style="font-size: 10px; margin-bottom: 12px;">
    หมายเลขคำสั่งซื้อ: #${data.orderNumber}
  </div>`;

  // Customer info
  if (data.memberName || data.memberPhone) {
    html += `<div style="font-size: 10px; margin-bottom: 12px;">
      ${data.memberName ? `ลูกค้า: ${data.memberName}<br/>` : ''}
      ${data.memberPhone ? `โทร: ${data.memberPhone}` : ''}
    </div>`;
  }

  html += `<hr style="border: 1px dashed #ccc; margin: 12px 0;" />`;

  // Items
  html += `<div style="font-size: 10px; font-weight: bold; margin-bottom: 8px;">รายการสินค้า</div>`;
  
  data.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    html += `<div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
      <div style="flex: 1;">${item.name} x${item.quantity}</div>
      <div>${formatPrice(itemTotal)}</div>
    </div>`;
    
    if (item.addons && item.addons.length > 0) {
      item.addons.forEach(addon => {
        html += `<div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-left: 16px; margin-bottom: 2px;">
          <div style="flex: 1;">+ ${addon.name}</div>
          <div>${formatPrice(addon.price)}</div>
        </div>`;
      });
    }
    
    if (item.item_discount && item.item_discount > 0) {
      const discountText = item.item_discount_type === 'percent' 
        ? `-${item.item_discount}%` 
        : `-฿${formatPrice(item.item_discount)}`;
      html += `<div style="font-size: 10px; color: #dc2626; margin-left: 16px; margin-bottom: 4px;">
        ส่วนลด: ${discountText}
      </div>`;
    }
  });

  html += `<hr style="border: 1px dashed #ccc; margin: 12px 0;" />`;

  // Totals
  html += `<div style="font-size: 10px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
      <span>ยอดรวม:</span>
      <span>${formatPrice(data.subtotal)} บาท</span>
    </div>`;
  
  if (data.itemDiscountTotal && data.itemDiscountTotal > 0) {
    html += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #dc2626;">
      <span>ส่วนลดรายการ:</span>
      <span>-${formatPrice(data.itemDiscountTotal)} บาท</span>
    </div>`;
  }
  
  if (data.billDiscount && data.billDiscount > 0) {
    html += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #dc2626;">
      <span>ส่วนลดท้ายบิล:</span>
      <span>-${formatPrice(data.billDiscount)} บาท</span>
    </div>`;
  }
  
  html += `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
      <span>รวมทั้งสิ้น:</span>
      <span>${formatPrice(data.totalAmount)} บาท</span>
    </div>
  </div>`;

  // Payment method
  const paymentMethodText = data.paymentMethod === 'cash' ? 'เงินสด' 
    : data.paymentMethod === 'qr' ? 'QR Code' 
    : data.paymentMethod === 'promptpay' ? 'PromptPay'
    : data.paymentMethod === 'points' ? 'แต้มสะสม'
    : data.paymentMethod;
  
  html += `<div style="font-size: 10px; margin-top: 12px;">
    ชำระด้วย: ${paymentMethodText}
  </div>`;

  html += `<hr style="border: 1px dashed #ccc; margin: 12px 0;" />`;

  // Footer message
  if (data.footerMessage) {
    html += `<div style="text-align: center; font-size: 10px; margin-top: 12px;">
      ${data.footerMessage}
    </div>`;
  }

  // WiFi Voucher
  if (data.wifiVoucher) {
    html += `<hr style="border: 1px dashed #ccc; margin: 12px 0;" />`;
    html += `<div style="border: 2px solid #dc2626; border-radius: 8px; padding: 12px; margin-top: 12px;">
      <div style="text-align: center; color: #dc2626; font-weight: bold; font-size: 12px; margin-bottom: 8px;">
        บัตรใช้งานอินเทอร์เน็ต
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
        <div style="color: #dc2626;">ชื่อผู้ใช้</div>
        <div style="color: #dc2626;">รหัสผ่าน</div>
        <div style="font-weight: bold;">${data.wifiVoucher.username}</div>
        <div style="font-weight: bold;">${data.wifiVoucher.password}</div>
      </div>
      ${data.wifiVoucher.qr_code_url ? `
        <div style="text-align: center; margin-top: 8px;">
          <img src="${data.wifiVoucher.qr_code_url}" style="width: 96px; height: 96px;" />
        </div>
      ` : ''}
    </div>`;
  }

  container.innerHTML = html;
  return container;
};

// Save receipt to photo album
export const saveReceiptToAlbum = async (data: ReceiptData): Promise<boolean> => {
  try {
    console.log('📸 Starting receipt save to album...');

    // Create receipt element
    const receiptElement = createReceiptElement(data);
    document.body.appendChild(receiptElement);

    // Preload logo if exists
    if (data.shopLogoUrl) {
      await preloadImage(data.shopLogoUrl);
    }

    // Small delay for rendering
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture as canvas
    const canvas = await html2canvas(receiptElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 5000,
    });

    // Remove temp element
    document.body.removeChild(receiptElement);

    // Get base64 data
    const base64Data = canvas.toDataURL('image/png').split(',')[1];
    const fileName = `receipt_${data.orderNumber}_${Date.now()}.png`;

    if (Capacitor.isNativePlatform()) {
      // Save to device photo gallery using @capacitor-community/media
      console.log('📱 [ReceiptSaver] Saving to native device photo album...');
      console.log('📱 [ReceiptSaver] Platform:', Capacitor.getPlatform());

      try {
        // First save to temp file in Cache directory
        const tempFileName = `receipt_temp_${Date.now()}.png`;
        console.log('📁 [ReceiptSaver] Creating temp file:', tempFileName);
        
        const tempResult = await Filesystem.writeFile({
          path: tempFileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        console.log('📁 [ReceiptSaver] Temp file created at:', tempResult.uri);

        // Get file path for Media plugin
        const filePath = tempResult.uri;
        console.log('📷 [ReceiptSaver] Attempting to save to Photos with path:', filePath);

        // Save directly to photo library (no album needed for simplicity)
        try {
          await Media.savePhoto({
            path: filePath,
          });
          console.log('✅ [ReceiptSaver] Receipt saved to Photos app successfully!');
        } catch (saveError: any) {
          console.error('❌ [ReceiptSaver] Media.savePhoto failed:', saveError?.message || saveError);
          
          // Try alternative approach - save with album
          try {
            const albumName = 'Receipts';
            console.log('📷 [ReceiptSaver] Trying with album:', albumName);
            
            // Try to create album first
            try {
              await Media.createAlbum({ name: albumName });
              console.log('📁 [ReceiptSaver] Album created:', albumName);
            } catch {
              console.log('📁 [ReceiptSaver] Album may already exist');
            }

            // Get albums to find identifier
            const albums = await Media.getAlbums();
            const album = albums.albums?.find(a => a.name === albumName);
            
            await Media.savePhoto({
              path: filePath,
              albumIdentifier: album?.identifier,
            });
            console.log('✅ [ReceiptSaver] Receipt saved to Photos with album!');
          } catch (albumError: any) {
            console.error('❌ [ReceiptSaver] Album approach also failed:', albumError?.message || albumError);
            throw albumError;
          }
        }

        // Clean up temp file
        try {
          await Filesystem.deleteFile({
            path: tempFileName,
            directory: Directory.Cache,
          });
          console.log('🧹 [ReceiptSaver] Temp file cleaned up');
        } catch (cleanupError) {
          console.log('⚠️ [ReceiptSaver] Temp file cleanup failed (non-critical)');
        }

        return true;
      } catch (mediaError: any) {
        console.error('❌ [ReceiptSaver] All media save methods failed:', mediaError?.message || mediaError);
        
        // Fallback to filesystem if Media plugin fails completely
        try {
          console.log('📁 [ReceiptSaver] Trying Documents fallback...');
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
          });
          console.log('✅ [ReceiptSaver] Receipt saved to Documents (fallback)');
          return true;
        } catch (fsError: any) {
          console.error('❌ [ReceiptSaver] Filesystem fallback also failed:', fsError?.message || fsError);
          return false;
        }
      }
    } else {
      // Web fallback - trigger download
      console.log('🌐 Web platform - triggering download...');
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      console.log('✅ Receipt download triggered');
      return true;
    }
  } catch (error) {
    console.error('❌ Error saving receipt to album:', error);
    return false;
  }
};

export default saveReceiptToAlbum;
