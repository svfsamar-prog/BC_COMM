/**
 * BC_COMM — QR Code Data URL Generator
 */
import QRCode from 'qrcode';

export async function generateVerificationQrDataUrl(verifyUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0F2942', // Navy QR dots
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code data URL:', err);
    return '';
  }
}
