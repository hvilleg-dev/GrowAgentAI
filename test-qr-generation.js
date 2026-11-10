const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

async function testQRGeneration() {
  console.log('🧪 Testing QR Code Generation\n');

  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: 'GrowAgentAI (test@example.com)',
      issuer: 'GrowAgentAI',
      length: 32
    });

    console.log('✅ Secret generated');
    console.log('   Base32:', secret.base32);
    console.log('   OTPAuth URL:', secret.otpauth_url);

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    console.log('\n✅ QR Code generated as data URL');
    console.log('   Length:', qrCodeUrl.length, 'bytes');
    console.log('   Starts with:', qrCodeUrl.substring(0, 50) + '...');

    // Check if it's valid data URL
    if (qrCodeUrl.startsWith('data:image/png;base64,')) {
      console.log('   ✓ Valid PNG data URL\n');
    } else {
      console.log('   ✗ Invalid data URL format\n');
    }

    // Simulate response
    const response = {
      message: '2FA secret generated. Scan QR code and enter code to enable.',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      manualEntryKey: secret.base32
    };

    console.log('📦 Response would be:');
    console.log('   message:', response.message);
    console.log('   qrCode length:', response.qrCode.length);
    console.log('   secret:', response.secret);
    console.log('\n🎉 QR Generation Test Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQRGeneration();
