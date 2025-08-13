import { registerPlugin } from '@capacitor/core';
import { StarPrinterPlugin } from './definitions';

const StarPrinterIOS = registerPlugin<StarPrinterPlugin>('StarPrinter', {
  ios: () => import('./ios-native').then(m => new m.StarPrinterIOSNative()),
});

export { StarPrinterIOS };