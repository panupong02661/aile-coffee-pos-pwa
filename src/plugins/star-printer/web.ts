
import { WebPlugin } from '@capacitor/core';
import { StarPrinterPlugin, StarPrinter, StarPrinterConfig, StarPrinterStatus } from './definitions';

export class StarPrinterWeb extends WebPlugin implements StarPrinterPlugin {
  async connect(options: { connectionType: 'USB' | 'Bluetooth' | 'LAN', deviceIdentifier?: string }): Promise<{ connected: boolean }> {
    console.log('Star Printer Web: connect called with', options);
    // Web implementation - return mock success for development
    return { connected: true };
  }

  async disconnect(): Promise<{ disconnected: boolean }> {
    console.log('Star Printer Web: disconnect called');
    return { disconnected: true };
  }

  async getStatus(): Promise<{ connected: boolean, deviceName?: string }> {
    console.log('Star Printer Web: getStatus called');
    return { connected: false };
  }

  async searchPrinters(): Promise<{ printers: StarPrinter[] }> {
    console.log('Star Printer Web: searchPrinters called');
    // Return mock printers for development
    return {
      printers: [
        {
          portName: 'USB001',
          modelName: 'TSP100III',
          connectionType: 'USB'
        }
      ]
    };
  }

  async print(options: { data: string, cutType?: 'NoCut' | 'PartialCut' | 'FullCut' }): Promise<{ success: boolean }> {
    console.log('Star Printer Web: print called with', options);
    // Web fallback - open print dialog
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt Print</title></head>
          <body style="font-family: monospace; white-space: pre-wrap;">${options.data}</body>
        </html>
      `);
      printWindow.document.close();
    }
    return { success: true };
  }

  async openCashDrawer(): Promise<{ opened: boolean }> {
    console.log('Star Printer Web: openCashDrawer called');
    return { opened: false };
  }

  async configure(options: StarPrinterConfig): Promise<{ configured: boolean }> {
    console.log('Star Printer Web: configure called with', options);
    return { configured: true };
  }
}
