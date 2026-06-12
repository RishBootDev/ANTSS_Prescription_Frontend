import { useState, useMemo } from "react";

export function useSearch<T>(
  items: T[],
  searchKeys: (keyof T)[],
  initialQuery = ""
) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();

    return items.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [items, searchKeys, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}
