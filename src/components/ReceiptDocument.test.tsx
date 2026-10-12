import { describe, expect, it } from 'vitest';
import { DEFAULT_RECEIPT_SETTINGS, shouldShowQueueNumber, shouldShowQueueQr } from './ReceiptDocument';

describe('ReceiptDocument queue settings', () => {
  it('hides the queue number when its setting is off', () => {
    const settings = { ...DEFAULT_RECEIPT_SETTINGS, show_queue_number: false };
    expect(shouldShowQueueNumber(settings, 22)).toBe(false);
  });

  it('hides the queue tracking section when its setting is off', () => {
    const settings = { ...DEFAULT_RECEIPT_SETTINGS, show_queue_qr: false };
    expect(shouldShowQueueQr(settings, 22)).toBe(false);
  });

  it('shows each queue section only when its setting is on and the order has a queue', () => {
    const settings = { ...DEFAULT_RECEIPT_SETTINGS, show_queue_number: true, show_queue_qr: true };
    expect(shouldShowQueueNumber(settings, 22)).toBe(true);
    expect(shouldShowQueueQr(settings, 22)).toBe(true);
    expect(shouldShowQueueNumber(settings, null)).toBe(false);
    expect(shouldShowQueueQr(settings, null)).toBe(false);
  });
});