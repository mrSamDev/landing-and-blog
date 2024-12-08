---
title: Why Your Frontend Needs a Safety Net
excerpt: Implementing data layer abstraction in React applications to handle API changes.
publishDate: 'Dec 8 2024'
tags:
  - Guide
  - JavaScript
  - Programming
  - Architecture
seo:
  image:
    src: '/js-symbols.jpg'
    alt: JavaScript code on a computer screen
---

Look, we've all been there. You're happily building your React app, everything's great, and then BAM - the backend team drops the bomb: "Hey, we're changing the API response structure next sprint!"

_Cue internal screaming_

Let me tell you why adding a data layer saved my sanity, and might save yours too.

## The Problem (AKA The Mess We've All Had)

Here's what most React components look like in the wild:

```javascript
function UserDashboard() {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      return res.json(); // 😱 Raw API data flowing everywhere
    }
  });

  return (
    <div>
      <h1>
        {data?.user?.first_name} {data?.user?.last_name}
      </h1>
      <span>{data?.user?.email_address}</span>
      {data?.settings?.preferences?.theme === 'dark' && <DarkModeIcon />}
      {data?.subscription?.status === 'active' && <ProBadge />}
    </div>
  );
}
```

## Life Without React Query (The Old Days)

Before we dive into our solution, let's look at how this problem manifests without React Query:

```javascript
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch('/api/user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>
        {user?.user?.first_name} {user?.user?.last_name}
      </h1>
      <span>{user?.user?.email_address}</span>
      {user?.settings?.preferences?.theme === 'dark' && <DarkModeIcon />}
      {user?.subscription?.status === 'active' && <ProBadge />}
    </div>
  );
}
```

Not only is this more code, but we're still dealing with the same data structure issues AND managing loading/error states manually. Yikes!

## The Solution (Your New Safety Net)

First, let's create our transformer - the thing that catches messy API data and makes it beautiful:

```typescript
// transforms/user.ts
type APIUser = {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
  };
  settings: {
    preferences: {
      theme: 'light' | 'dark';
    };
  };
  subscription: {
    status: 'active' | 'inactive';
  };
};

type AppUser = {
  id: string;
  fullName: string;
  email: string;
  settings: {
    isDarkMode: boolean;
    isPro: boolean;
  };
};

const userTransformer = {
  fromAPI(apiData: APIUser): AppUser {
    return {
      id: apiData.user.id,
      fullName: `${apiData.user.first_name} ${apiData.user.last_name}`,
      email: apiData.user.email_address,
      settings: {
        isDarkMode: apiData.settings.preferences.theme === 'dark',
        isPro: apiData.subscription.status === 'active'
      }
    };
  },

  toAPI(userData: AppUser): APIUser {
    const [firstName, ...lastNameParts] = userData.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      user: {
        id: userData.id,
        first_name: firstName,
        last_name: lastName,
        email_address: userData.email
      },
      settings: {
        preferences: {
          theme: userData.settings.isDarkMode ? 'dark' : 'light'
        }
      },
      subscription: {
        status: userData.settings.isPro ? 'active' : 'inactive'
      }
    };
  }
};
```

## Supercharging with TanStack Query

[TanStack Query](https://tanstack.com/query/latest) (the new name for React Query) makes this pattern even more powerful:

```typescript
// hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';

function useUser() {
  return useQuery<AppUser, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      const apiData = await res.json();
      return userTransformer.fromAPI(apiData);
    }
  });
}

// Your component stays clean and happy
function UserDashboard() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <span>{user?.email}</span>
      {user?.settings.isDarkMode && <DarkModeIcon />}
      {user?.settings.isPro && <ProBadge />}
    </div>
  );
}
```

## Adding Type Safety with Zod

Want to make this even more bulletproof? Let's add Zod for runtime type validation:

```typescript
// types/schemas/user.ts
import { z } from 'zod';

// Define the API response schema
export const apiUserSchema = z.object({
  user: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email_address: z.string().email()
  }),
  settings: z.object({
    preferences: z.object({
      theme: z.enum(['light', 'dark'])
    })
  }),
  subscription: z.object({
    status: z.enum(['active', 'inactive'])
  })
});

// Define your app's data model
export const appUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  settings: z.object({
    isDarkMode: z.boolean(),
    isPro: z.boolean()
  })
});

// Types inferred from schemas
export type APIUser = z.infer<typeof apiUserSchema>;
export type AppUser = z.infer<typeof appUserSchema>;

// Updated transformer with validation
export const userTransformer = {
  fromAPI(apiData: unknown): AppUser {
    // Validate API data
    const validated = apiUserSchema.parse(apiData);

    const transformed = {
      id: validated.user.id,
      fullName: `${validated.user.first_name} ${validated.user.last_name}`,
      email: validated.user.email_address,
      settings: {
        isDarkMode: validated.settings.preferences.theme === 'dark',
        isPro: validated.subscription.status === 'active'
      }
    };

    // Validate transformed data
    return appUserSchema.parse(transformed);
  },

  toAPI(userData: AppUser): APIUser {
    const [firstName, ...lastNameParts] = userData.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    const transformed = {
      user: {
        id: userData.id,
        first_name: firstName,
        last_name: lastName,
        email_address: userData.email
      },
      settings: {
        preferences: {
          theme: userData.settings.isDarkMode ? 'dark' : 'light'
        }
      },
      subscription: {
        status: userData.settings.isPro ? 'active' : 'inactive'
      }
    };

    // Validate before sending to API
    return apiUserSchema.parse(transformed);
  }
};
```

## Here's Where to Put Everything

```
src/
├── transforms/           # Your safety net lives here
│   └── user.ts
├── hooks/               # React Query + transforms = ❤️
│   └── useUser.ts
├── types/
│   └── schemas/         # Zod schemas and types
│       └── user.ts      # Contains schemas, types, and transformers
└── components/          # Clean, happy components
    └── UserDashboard.tsx
```

## Why This Saves Your Bacon 🥓

1. API changes? Just update the transformer. Your components don't need to know or care.
2. Testing becomes a breeze because you're working with clean, predictable data
3. TypeScript stops yelling at you because your data shape is consistent
4. New team members don't need to decode cryptic API responses
5. Runtime type validation catches API inconsistencies before they break your UI

## The Really Cool Part

Need to support both old and new API versions during a migration? Here's how:

```typescript
// transforms/user.ts
type OldAPIFormat = {
  firstName: string;
  lastName: string;
  // ... old format fields
};

type NewAPIFormat = {
  user: {
    first_name: string;
    last_name: string;
    // ... new format fields
  };
};

function isNewAPIFormat(data: unknown): data is NewAPIFormat {
  return typeof data === 'object' && data !== null && 'user' in data;
}

function transformNewFormat(apiData: NewAPIFormat): AppUser {
  // Transform new format
  return {
    // ... transformation logic
  };
}

function transformOldFormat(apiData: OldAPIFormat): AppUser {
  // Transform old format
  return {
    // ... transformation logic
  };
}

const userTransformer = {
  fromAPI(apiData: unknown): AppUser {
    if (isNewAPIFormat(apiData)) {
      return transformNewFormat(apiData);
    }
    return transformOldFormat(apiData as OldAPIFormat);
  }
};
```

Remember: A little bit of transformation today saves weeks of refactoring tomorrow.
