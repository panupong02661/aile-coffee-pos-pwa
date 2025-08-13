import { WebPlugin } from '@capacitor/core';
import { StarPrinterPlugin, StarPrinter, StarPrinterConfig, StarPrinterStatus } from './definitions';

export class StarPrinterIOSNative extends WebPlugin implements StarPrinterPlugin {
  
  async connect(options: { connectionType: 'USB' | 'Bluetooth' | 'LAN', deviceIdentifier?: string }): Promise<{ connected: boolean }> {
    try {
      const result = await this.call('connect', options);
      return result;
    } catch (error) {
      console.error('StarPrinter iOS connect error:', error);
      return { connected: false };
    }
  }

  async disconnect(): Promise<{ disconnected: boolean }> {
    try {
      const result = await this.call('disconnect');
      return result;
    } catch (error) {
      console.error('StarPrinter iOS disconnect error:', error);
      return { disconnected: false };
    }
  }

  async getStatus(): Promise<{ connected: boolean, deviceName?: string }> {
    try {
      const result = await this.call('getStatus');
      return result;
    } catch (error) {
      console.error('StarPrinter iOS getStatus error:', error);
      return { connected: false };
    }
  }

  async searchPrinters(): Promise<{ printers: StarPrinter[] }> {
    try {
      const result = await this.call('searchPrinters');
      return result;
    } catch (error) {
      console.error('StarPrinter iOS searchPrinters error:', error);
      return { printers: [] };
    }
  }

  async print(options: { data: string, cutType?: 'NoCut' | 'PartialCut' | 'FullCut' }): Promise<{ success: boolean }> {
    try {
      const result = await this.call('print', options);
      return result;
    } catch (error) {
      console.error('StarPrinter iOS print error:', error);
      return { success: false };
    }
  }

  async openCashDrawer(): Promise<{ opened: boolean }> {
    try {
      const result = await this.call('openCashDrawer');
      return result;
    } catch (error) {
      console.error('StarPrinter iOS openCashDrawer error:', error);
      return { opened: false };
    }
  }

  async configure(options: StarPrinterConfig): Promise<{ configured: boolean }> {
    try {
      const result = await this.call('configure', options);
      return result;
    } catch (error) {
      console.error('StarPrinter iOS configure error:', error);
      return { configured: false };
    }
  }

  private async call(method: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // This will be handled by the native iOS plugin
      // @ts-ignore
      if (window.StarPrinter && window.StarPrinter[method]) {
        // @ts-ignore
        window.StarPrinter[method](options, resolve, reject);
      } else {
        reject(new Error(`StarPrinter iOS method ${method} not available`));
      }
    });
  }
}