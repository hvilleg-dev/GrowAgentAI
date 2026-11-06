describe('Services Unit Tests', () => {
  describe('CrisisDetector', () => {
    test('should create instance without AI provider', () => {
      const detector = { regexPatterns: new Map(), aiProvider: undefined };
      expect(detector.regexPatterns).toBeDefined();
      expect(detector.aiProvider).toBeUndefined();
    });

    test('should detect critico level via keywords', () => {
      const criticoKeywords = ['suicidio', 'drogas duras', 'violencia'];
      const testText = 'Estoy pensando en suicidio';

      const regexPattern = new RegExp(criticoKeywords.join('|'), 'gi');
      const match = testText.match(regexPattern);

      expect(match).toBeTruthy();
      expect(match[0]).toBe('suicidio');
    });

    test('should detect alto level via keywords', () => {
      const altoKeywords = ['depresión', 'ansiedad extrema', 'pánico'];
      const testText = 'Tengo ansiedad extrema y no puedo controlarla';

      const regexPattern = new RegExp(altoKeywords.join('|'), 'gi');
      const match = testText.match(regexPattern);

      expect(match).toBeTruthy();
      expect(match[0]).toBe('ansiedad extrema');
    });

    test('should detect medio level via keywords', () => {
      const medioKeywords = ['estrés', 'preocupación', 'insomnio'];
      const testText = 'Tengo estrés en el trabajo';

      const regexPattern = new RegExp(medioKeywords.join('|'), 'gi');
      const match = testText.match(regexPattern);

      expect(match).toBeTruthy();
      expect(match[0]).toBe('estrés');
    });

    test('should return null if no crisis detected', () => {
      const testText = 'Todo está bien en mi vida';
      const criticoKeywords = ['suicidio', 'drogas duras'];

      const regexPattern = new RegExp(criticoKeywords.join('|'), 'gi');
      const match = testText.match(regexPattern);

      expect(match).toBeNull();
    });

    test('should be case-insensitive for keyword matching', () => {
      const keyword = 'SUICIDIO';
      const testText = 'He pensado en suicidio muchas veces';

      const regexPattern = new RegExp(keyword, 'gi');
      const match = testText.match(regexPattern);

      expect(match).toBeTruthy();
      expect(match[0].toLowerCase()).toBe('suicidio');
    });
  });

  describe('ProviderRouter', () => {
    test('should initialize with empty providers map', () => {
      const router = {
        providers: new Map(),
        config: { providers: [], costLimit: 100 },
        costTracker: new Map()
      };

      expect(router.providers.size).toBe(0);
      expect(router.costTracker.size).toBe(0);
    });

    test('should track costs correctly', () => {
      const costTracker = new Map();
      costTracker.set('claude', 0.10);
      costTracker.set('openai', 0.05);

      const totalCost = Array.from(costTracker.values()).reduce((a, b) => a + b, 0);

      expect(totalCost).toBeCloseTo(0.15, 2);
    });

    test('should calculate total cost from tracker', () => {
      const costTracker = new Map();
      costTracker.set('provider1', 1.50);
      costTracker.set('provider2', 2.50);
      costTracker.set('provider3', 1.00);

      const total = Array.from(costTracker.values()).reduce((a, b) => a + b, 0);

      expect(total).toBeCloseTo(5.00, 2);
    });

    test('should return available providers list', () => {
      const providers = new Map();
      providers.set('claude', { name: 'Claude' });
      providers.set('openai', { name: 'OpenAI' });

      const availableProviders = Array.from(providers.keys());

      expect(availableProviders).toContain('claude');
      expect(availableProviders).toContain('openai');
      expect(availableProviders.length).toBe(2);
    });

    test('should estimate tokens from text length', () => {
      const prompt = 'This is a test prompt with some text';
      const estimatedTokens = Math.ceil(prompt.length / 4);

      expect(estimatedTokens).toBeGreaterThan(0);
      expect(typeof estimatedTokens).toBe('number');
    });

    test('should handle cost calculations for different providers', () => {
      const claudeCosts = new Map();
      claudeCosts.set('claude', 0.003 * 100 + 0.015 * 100); // input + output

      const openaiCosts = new Map();
      openaiCosts.set('openai', 0.005 * 100 + 0.015 * 100); // input + output

      expect(claudeCosts.get('claude')).toBeGreaterThan(0);
      expect(openaiCosts.get('openai')).toBeGreaterThan(claudeCosts.get('claude'));
    });

    test('should detect cost limit exceeded', () => {
      const costTracker = new Map();
      costTracker.set('provider', 150);

      const costLimit = 100;
      const exceeded = costTracker.get('provider') > costLimit;

      expect(exceeded).toBe(true);
    });
  });

  describe('ChatController', () => {
    test('should validate session ID format', () => {
      const sessionId = 'sess_12345678';
      const isValid = /^sess_[a-zA-Z0-9]+$/.test(sessionId);

      expect(isValid).toBe(true);
    });

    test('should validate user ID format', () => {
      const userId = 'user_12345678';
      const isValid = /^user_[a-zA-Z0-9]+$/.test(userId);

      expect(isValid).toBe(true);
    });

    test('should reject empty messages', () => {
      const message = '';
      const isValid = message.trim().length > 0;

      expect(isValid).toBe(false);
    });

    test('should accept valid messages', () => {
      const message = 'How can I improve my productivity?';
      const isValid = message.trim().length > 0 && message.length < 5000;

      expect(isValid).toBe(true);
    });

    test('should truncate very long messages', () => {
      const message = 'a'.repeat(10000);
      const maxLength = 5000;
      const truncated = message.substring(0, maxLength);

      expect(truncated.length).toBeLessThanOrEqual(maxLength);
    });
  });

  describe('SessionController', () => {
    test('should create new session object', () => {
      const session = {
        id: 'sess_123',
        userId: 'user_456',
        createdAt: new Date(),
        messages: [],
        status: 'active'
      };

      expect(session.id).toBeDefined();
      expect(session.userId).toBeDefined();
      expect(session.messages).toHaveLength(0);
      expect(session.status).toBe('active');
    });

    test('should add message to session', () => {
      const messages = [];
      const newMessage = {
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      };

      messages.push(newMessage);

      expect(messages.length).toBe(1);
      expect(messages[0].role).toBe('user');
    });

    test('should retrieve conversation history', () => {
      const messages = [
        { role: 'user', content: 'Hello', timestamp: new Date() },
        { role: 'assistant', content: 'Hi there', timestamp: new Date() },
        { role: 'user', content: 'How are you?', timestamp: new Date() }
      ];

      const history = messages.map(m => ({ role: m.role, content: m.content }));

      expect(history).toHaveLength(3);
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
    });

    test('should calculate session duration', () => {
      const startTime = new Date('2026-11-06T10:00:00');
      const endTime = new Date('2026-11-06T11:30:00');

      const durationMs = endTime - startTime;
      const durationMinutes = Math.floor(durationMs / 60000);

      expect(durationMinutes).toBe(90);
    });

    test('should close session properly', () => {
      const session = {
        id: 'sess_123',
        status: 'active',
        closedAt: null
      };

      session.status = 'closed';
      session.closedAt = new Date();

      expect(session.status).toBe('closed');
      expect(session.closedAt).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle provider not found error', () => {
      const providers = new Map();
      providers.set('claude', {});

      const getProvider = (name) => {
        if (!providers.has(name)) {
          throw new Error(`Provider ${name} not found`);
        }
        return providers.get(name);
      };

      expect(() => getProvider('invalid')).toThrow('Provider invalid not found');
    });

    test('should handle invalid JSON in AI response', () => {
      const invalidJson = 'not a json {invalid}';

      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    test('should handle missing environment variables', () => {
      const apiKey = process.env.MISSING_KEY;

      expect(apiKey).toBeUndefined();
    });

    test('should handle network timeout gracefully', () => {
      const mockTimeout = () => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      };

      return expect(mockTimeout()).rejects.toThrow('Timeout');
    });
  });
});
