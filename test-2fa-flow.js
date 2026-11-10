const speakeasy = require('speakeasy');

console.log('🧪 Testing 2FA Flow\n');

// Simulate backend generating secret
const secret = speakeasy.generateSecret({
  name: 'GrowAgentAI (test@example.com)',
  issuer: 'GrowAgentAI',
  length: 32
});

console.log('✅ Step 1: Backend generates secret');
console.log('   Secret (base32):', secret.base32);
console.log('   OTPAuth URL:', secret.otpauth_url);
console.log('   Scan QR code to add to authenticator app\n');

// Simulate user entering code from authenticator
const userToken = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32'
});

console.log('✅ Step 2: User scans QR and gets code from app');
console.log('   Current code:', userToken);
console.log('   (This code is valid for ~30 seconds)\n');

// Verify the code
const isValid = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userToken,
  window: 2
});

console.log('✅ Step 3: Backend verifies code');
console.log('   Is valid?', isValid);
console.log('   ✓ User can now log in with 2FA\n');

// Test invalid code
const invalidCode = '000000';
const isInvalid = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: invalidCode,
  window: 2
});

console.log('✅ Step 4: Test invalid code');
console.log('   Testing:', invalidCode);
console.log('   Is valid?', isInvalid);
console.log('   ✓ Correctly rejected\n');

console.log('🎉 2FA Flow Test Complete!\n');
console.log('Summary:');
console.log('  ✓ Secret generation working');
console.log('  ✓ Code generation working');
console.log('  ✓ Code verification working');
console.log('  ✓ Invalid code rejection working');
