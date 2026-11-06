# Testing Guide

Unit, integration, and E2E testing strategy.

## Testing Pyramid

```
        E2E Tests (5%)
       /            \
      /  Integration \
     /    Tests (25%) \
    /                   \
   /     Unit Tests      \
  / (70% of coverage)     \
 /_________________________\
```

## Unit Tests

### Backend Unit Tests

```bash
# Setup
cd backend
npm install --save-dev jest @types/jest ts-jest

# Create jest.config.js
npx jest --init

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Example: Service Test

```typescript
// backend/src/services/__tests__/goalsService.test.ts
import { goalsService } from '../goalsService';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma');

describe('GoalsService', () => {
  describe('createGoal', () => {
    it('should create a goal with valid data', async () => {
      const mockGoal = {
        id: '1',
        title: 'Learn TypeScript',
        user_id: 'user-1',
      };

      (prisma.goal.create as jest.Mock).mockResolvedValue(mockGoal);

      const result = await goalsService.createGoal({
        user_id: 'user-1',
        title: 'Learn TypeScript',
      });

      expect(result).toEqual(mockGoal);
      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Learn TypeScript',
        }),
      });
    });

    it('should throw error with invalid data', async () => {
      await expect(
        goalsService.createGoal({
          user_id: 'user-1',
          title: '',
        })
      ).rejects.toThrow('Title required');
    });
  });
});
```

### Frontend Unit Tests

```bash
cd frontend/web
npm install --save-dev @testing-library/react vitest

# Run tests
npm test

# Coverage
npm run test:coverage
```

### Example: Component Test

```typescript
// frontend/web/src/components/__tests__/GoalCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalCard from '../Goals/GoalCard';

describe('GoalCard', () => {
  const mockGoal = {
    id: '1',
    title: 'Learn TypeScript',
    progress: 50,
    status: 'active',
  };

  it('renders goal correctly', () => {
    render(<GoalCard goal={mockGoal} />);
    
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<GoalCard goal={mockGoal} onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Integration Tests

### API Integration Tests

```typescript
// backend/tests/integration/goals.test.ts
import request from 'supertest';
import app from '../../src/server';

describe('Goals API', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpass123',
      });

    token = res.body.access_token;
    userId = res.body.user.id;
  });

  describe('POST /goals', () => {
    it('should create a goal', async () => {
      const res = await request(app)
        .post('/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Learn TypeScript',
          description: 'Master the basics',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Learn TypeScript');
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'No title',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /goals', () => {
    it('should list user goals', async () => {
      const res = await request(app)
        .get('/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
```

## End-to-End Tests

### E2E with Playwright

```bash
# Install
npm install --save-dev @playwright/test

# Create playwright.config.ts
npx playwright install
```

### Example: E2E Scenario

```typescript
// frontend/e2e/goals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Goal Workflow', () => {
  test('should create and track a goal', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000');
    await page.fill('[data-testid="email"]', 'demo@growagentai.com');
    await page.fill('[data-testid="password"]', 'demo123456');
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Create goal
    await page.click('[data-testid="new-goal"]');
    await page.fill('[data-testid="goal-title"]', 'Learn TypeScript');
    await page.fill('[data-testid="goal-description"]', 'Become proficient');
    await page.click('[data-testid="save-goal"]');

    // Verify goal created
    await expect(page.locator('text=Learn TypeScript')).toBeVisible();

    // Start coaching session
    await page.click('[data-testid="start-session"]');
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'How do I start?');
    await page.click('[data-testid="send-button"]');

    // Verify response
    await expect(page.locator('text=Great!')).toBeVisible({ timeout: 5000 });
  });
});
```

### Run E2E Tests

```bash
# Headed mode (see browser)
npm run test:e2e

# Headless
npm run test:e2e -- --headed=false

# Single file
npm run test:e2e goals.spec.ts

# Debug
npm run test:e2e -- --debug
```

## Coverage Goals

| Type | Target |
|------|--------|
| Unit Tests | 80%+ |
| Integration Tests | 60%+ |
| E2E Tests | Core workflows |
| Overall | 70%+ |

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Testing Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Arrange-Act-Assert pattern**
4. **Mock external dependencies**
5. **Test edge cases**
6. **Keep tests focused**
7. **Run tests before commits**

## Debug Tests

```bash
# Node debugger
node --inspect-brk ./node_modules/.bin/jest --runInBand

# VS Code debugger
# .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"]
}
```

## Performance Testing

```typescript
// backend/tests/performance/large-dataset.test.ts
test('should handle 1000 goals efficiently', async () => {
  const start = performance.now();
  
  const goals = await prisma.goal.findMany({
    where: { user_id: userId },
    take: 1000,
  });
  
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(500); // Must complete in 500ms
  expect(goals).toHaveLength(1000);
});
```

## References

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Supertest Docs](https://github.com/visionmedia/supertest)

---

[Back to Docs](00_START_HERE.md)
