---
title: Zustand Structure coding tools rule
publishDate: 'Jun 28 2025'
isPublished: true
---

## Structuring Application State with Zustand

This guide provides principles for structuring application state using Zustand, a small, fast, and scalable bearbones state-management solution.

### 1. Define a Clear State Interface (with Actions)

Start by defining a TypeScript interface that explicitly describes the structure of your application's state _and_ the actions that will modify it. This is crucial for type safety and maintainability.

```typescript
interface MyStore {
  dataItems: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: string | null;

  actions: {
    setDataItems: (items: Item[]) => void; // Sets the entire list of data items.
    setSelectedItem: (item: Item | null) => void; // Sets the currently selected item.
    updateItem: (id: string, updates: Partial<Item>) => void; // Updates a specific item's properties by ID.
    clearError: () => void; // Clears any error message.
  };
}
```

**Explanation:**

- The interface clearly defines the state _and_ the functions (actions) that modify it.
- Descriptive comments explain the purpose of each action.

### 2. Creating the Zustand Store

Use the `create` function from Zustand to create your store. It's common to also use middleware like `devtools` (for debugging) and `immer` (for simplified immutable updates).

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware';

export const useMyStore = create<MyStore>()(
  devtools(
    immer((set) => ({
      dataItems: [],
      selectedItem: null,
      isLoading: false,
      error: null,

      actions: {
        setDataItems: (items) => set({ dataItems: items }),
        setSelectedItem: (item) => set({ selectedItem: item }),
        updateItem: (id, updates) =>
          set((state) => {
            const index = state.dataItems.findIndex((item) => item.id === id);
            if (index !== -1) {
              state.dataItems[index] = { ...state.dataItems[index], ...updates };
            }
          }),
        clearError: () => set({ error: null })
      }
    })),
    { name: 'my-store' } // Optional: Name for devtools
  )
);
```

**Explanation:**

- `create`: The core function from Zustand.
- `devtools`: Enables Redux DevTools integration for easy state inspection.
- `immer`: Simplifies immutable updates. You can write code that _looks_ mutable, but Immer handles the immutability behind the scenes.
- `set`: The function provided by Zustand to update the store's state.
- The function passed to `create` defines the initial state and the actions.

### 3. Using the Store in Components

Use the `useMyStore` hook (or whatever you named your store hook) to access the state and actions in your components.

```typescript
import { useMyStore } from './your-store-file'; // Adjust the path

const MyComponent = () => {
  const { dataItems, selectedItem, actions } = useMyStore();

  const handleUpdateItem = (id: string, updates: Partial<Item>) => {
    actions.updateItem(id, updates);
  };

  return (
    <>
      {/* Example: Displaying a list of items */}
      <ul>
        {dataItems.map((item) => (
          <li key={item.id}>
            {item.name} - <button onClick={() => handleUpdateItem(item.id, { name: "Updated Name" })}>Update Name</button>
          </li>
        ))}
      </ul>
    </>
  );
};
```
