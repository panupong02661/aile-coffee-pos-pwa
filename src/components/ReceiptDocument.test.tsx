import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DEFAULT_RECEIPT_SETTINGS, ReceiptDocument } from './ReceiptDocument';

const renderReceipt = (showQueueNumber: boolean, showQueueQr: boolean) => renderToStaticMarkup(
  <ReceiptDocument
    cartItems={[]}
    totalAmount={0}
    orderNumber="ORD-QUEUE-1"
    queueNumber={22}
    shopSettings={{ shop_name: 'Aile Coffee' }}
    receiptSettings={{
      ...DEFAULT_RECEIPT_SETTINGS,
      show_queue_number: showQueueNumber,
      show_queue_qr: showQueueQr,
    }}
  />,
);

describe('ReceiptDocument queue settings', () => {
  it('hides the queue number when its setting is off', () => {
    const markup = renderReceipt(false, true);
    expect(markup).not.toContain('คิวของคุณ');
  });

  it('hides the queue tracking section when its setting is off', () => {
    const markup = renderReceipt(true, false);
    expect(markup).not.toContain('แสกน QR เพื่อติดตามคิว');
  });

  it('hides both queue sections when both settings are off', () => {
    const markup = renderReceipt(false, false);
    expect(markup).not.toContain('คิวของคุณ');
    expect(markup).not.toContain('แสกน QR เพื่อติดตามคิว');
  });
});