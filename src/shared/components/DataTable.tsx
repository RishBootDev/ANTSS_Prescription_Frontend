import React from "react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    nextPage: () => void;
    prevPage: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-sm text-left">
          <thead>
            <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-3.5 ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={keyExtractor(row, rIdx)}
                  className="border-b hover:bg-muted/20 transition-colors last:border-0"
                >
                  {columns.map((col, cIdx) => {
                    const content = col.cell
                      ? col.cell(row, rIdx)
                      : col.accessorKey
                      ? (row[col.accessorKey] as React.ReactNode)
                      : null;

                    return (
                      <td
                        key={cIdx}
                        className={`p-3.5 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-3.5 border-t border-border/50 bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevious}
            onClick={pagination.prevPage}
            className="text-xs h-8"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={pagination.nextPage}
            className="text-xs h-8"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
