import { useState, useMemo } from "react";

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialItemsPerPage = 5,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
    startIndex,
    endIndex,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
