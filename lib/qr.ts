import 'server-only';
import QRCode from 'qrcode';

/**
 * Generate a QR code locally. The device-link token is never sent to an
 * external QR service.
 */
export async function createQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: 'svg',
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#10201A',
      light: '#FFFFFF',
    },
  });
}
