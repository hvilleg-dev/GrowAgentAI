# Frontend Development Guide

Frontend architecture and component development.

## Overview

**Web:** React 18 + Vite + TailwindCSS
**Desktop:** Electron + Shared React components
**Mobile:** React Native + Expo

## Project Structure

```
frontend/
├── web/
│  ├── src/
│  │  ├── components/
│  │  │  ├── Chat/
│  │  │  │  ├── ChatMessage.tsx
│  │  │  │  ├── ChatInput.tsx
│  │  │  │  └── ChatWindow.tsx
│  │  │  ├── Goals/
│  │  │  │  ├── GoalCard.tsx
│  │  │  │  ├── GoalForm.tsx
│  │  │  │  └── GoalList.tsx
│  │  │  ├── Dashboard/
│  │  │  │  ├── ProgressChart.tsx
│  │  │  │  └── StatsCard.tsx
│  │  │  └── Common/
│  │  │     ├── Header.tsx
│  │  │     ├── Sidebar.tsx
│  │  │     └── Footer.tsx
│  │  ├── pages/
│  │  │  ├── Home.tsx
│  │  │  ├── Dashboard.tsx
│  │  │  ├── Goals.tsx
│  │  │  ├── Session.tsx
│  │  │  └── Settings.tsx
│  │  ├── hooks/
│  │  │  ├── useGoals.ts
│  │  │  ├── useSessions.ts
│  │  │  └── useAuth.ts
│  │  ├── services/
│  │  │  ├── api.ts
│  │  │  ├── authService.ts
│  │  │  └── coachingService.ts
│  │  ├── store/
│  │  │  ├── slices/
│  │  │  │  ├── authSlice.ts
│  │  │  │  ├── goalsSlice.ts
│  │  │  │  └── sessionsSlice.ts
│  │  │  └── index.ts
│  │  ├── types/
│  │  │  └── index.ts
│  │  ├── styles/
│  │  │  └── globals.css
│  │  └── App.tsx
│  └── package.json
├── desktop/
│  └── electron-app/
└── mobile/
   └── react-native-app/
```

## Key Components

### Chat Component

```tsx
// components/Chat/ChatWindow.tsx
import React, { useEffect, useRef } from 'react';
import { useSessions } from '@/hooks/useSessions';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  sessionId: string;
}

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const { messages, loading, sendMessage } = useSessions(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isUser={msg.role === 'user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={loading}
        placeholder="Ask your coach..."
      />
    </div>
  );
}
```

### Goals Dashboard

```tsx
// components/Dashboard/GoalsDashboard.tsx
import React from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from '../Goals/GoalCard';
import { Skeleton } from '@/components/Common/Skeleton';

export default function GoalsDashboard() {
  const { goals, loading } = useGoals();

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} />)}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
```

## Hooks (Data Management)

### useGoals Hook

```tsx
// hooks/useGoals.ts
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { goalsService } from '@/services';
import { setGoals, addGoal } from '@/store/slices/goalsSlice';

export function useGoals() {
  const dispatch = useDispatch();
  const goals = useSelector(state => state.goals.list);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsService.getGoals(),
    onSuccess: (data) => dispatch(setGoals(data)),
  });

  const createGoal = useMutation({
    mutationFn: (goal) => goalsService.createGoal(goal),
    onSuccess: (newGoal) => dispatch(addGoal(newGoal)),
  });

  return {
    goals: goals || [],
    loading: isLoading,
    createGoal: createGoal.mutate,
  };
}
```

### useSessions Hook

```tsx
// hooks/useSessions.ts
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { sessionsService } from '@/services';

export function useSessions(sessionId: string) {
  const [messages, setMessages] = useState([]);

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsService.getSession(sessionId),
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      sessionsService.sendMessage(sessionId, content),
    onSuccess: (response) => {
      setMessages(prev => [...prev, response]);
    },
  });

  useEffect(() => {
    if (session?.messages) {
      setMessages(session.messages);
    }
  }, [session]);

  return {
    messages,
    loading: sendMessage.isPending,
    sendMessage: (content) => sendMessage.mutate(content),
  };
}
```

## State Management (Redux)

### Goals Slice

```tsx
// store/slices/goalsSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    list: [],
    selected: null,
    loading: false,
  },
  reducers: {
    setGoals: (state, action) => {
      state.list = action.payload;
    },
    addGoal: (state, action) => {
      state.list.push(action.payload);
    },
    updateGoal: (state, action) => {
      const index = state.list.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteGoal: (state, action) => {
      state.list = state.list.filter(g => g.id !== action.payload);
    },
  },
});

export const { setGoals, addGoal, updateGoal, deleteGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
```

## API Service

```tsx
// services/api.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const token = await refreshAccessToken();
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Styling with TailwindCSS

```tsx
// components/Goals/GoalCard.tsx
export default function GoalCard({ goal }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {goal.title}
        </h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {goal.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{goal.description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* GROW Stage */}
      <div className="flex gap-2">
        {['G', 'R', 'O', 'W'].map(stage => (
          <div
            key={stage}
            className={`
              flex-1 py-2 text-center rounded
              ${goal.grow_stage === stage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'}
            `}
          >
            {stage}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Components

```tsx
// components/__tests__/GoalCard.test.tsx
import { render, screen } from '@testing-library/react';
import GoalCard from '../Goals/GoalCard';

describe('GoalCard', () => {
  const mockGoal = {
    id: '1',
    title: 'Learn TypeScript',
    description: 'Master TypeScript basics',
    progress: 45,
    status: 'active',
    grow_stage: 'O',
  };

  it('renders goal title', () => {
    render(<GoalCard goal={mockGoal} />);
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
  });

  it('displays progress bar', () => {
    render(<GoalCard goal={mockGoal} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows GROW stage indicator', () => {
    render(<GoalCard goal={mockGoal} />);
    expect(screen.getByText('O')).toHaveClass('bg-blue-500');
  });
});
```

## Setup Development Environment

```bash
cd frontend/web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local:
# VITE_API_URL=http://localhost:3001

# Start dev server (hot reload)
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Lint & format
npm run lint
npm run format
```

## Performance Optimization

- **Code splitting:** Automatic with Vite
- **Lazy loading:** React.lazy() for routes
- **Image optimization:** Use next-gen formats
- **Caching:** React Query with staleTime/cacheTime
- **Bundling:** Production build with tree-shaking

## Design System

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for:
- Color palette
- Typography
- Components library
- Accessibility guidelines

## References

- [Architecture](03_ARCHITECTURE.md)
- [API Reference](04_API_REFERENCE.md)
- [Testing Guide](07_TESTING.md)
- [React Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com)

---

[Back to Docs](00_START_HERE.md)
