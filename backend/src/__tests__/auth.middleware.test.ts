import { generateToken, verifyToken } from '@/middleware/auth.middleware';

describe('Auth Middleware', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'test-user-123';
      const email = 'test@example.com';

      const token = generateToken(userId, email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const userId = 'test-user-123';
      const email = 'test@example.com';

      const token = generateToken(userId, email);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjN9.fake-signature';

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow();
    });
  });
});
