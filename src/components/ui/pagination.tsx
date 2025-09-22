import {
  component$,
  useSignal,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange$?: (page: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  size?: "sm" | "default" | "lg";
  class?: string;
};

export const Pagination = component$<PaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange$,
    showFirstLast = true,
    showPageNumbers = true,
    maxPageNumbers = 5,
    size = "default",
    class: className,
  }) => {
    const currentPageSignal = useSignal(currentPage);

    const handlePageChange = $((page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPageSignal.value) {
        currentPageSignal.value = page;
        onPageChange$?.(page);
      }
    });

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const half = Math.floor(maxPageNumbers / 2);

      let startPage = Math.max(1, currentPageSignal.value - half);
      const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxPageNumbers) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add last page and ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }

      return pages;
    };

    if (totalPages <= 1) {
      return null;
    }

    const pageNumbers = getPageNumbers();

    return (
      <nav
        class={cn("flex items-center space-x-2", className)}
        aria-label="Pagination Navigation"
      >
        {/* First button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick$={() => handlePageChange(1)}
            disabled={currentPageSignal.value === 1}
            aria-label="Go to first page"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </Button>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size={size}
          onClick$={() => handlePageChange(currentPageSignal.value - 1)}
          disabled={currentPageSignal.value === 1}
          aria-label="Go to previous page"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="sr-only">Previous</span>
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div class="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span class="px-3 py-2 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={
                      page === currentPageSignal.value ? "default" : "outline"
                    }
                    size={size}
                    onClick$={() => handlePageChange(page as number)}
                    aria-label={`Go to page ${page}`}
                    aria-current={
                      page === currentPageSignal.value ? "page" : undefined
                    }
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size={size}
          onClick$={() => handlePageChange(currentPageSignal.value + 1)}
          disabled={currentPageSignal.value === totalPages}
          aria-label="Go to next page"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="sr-only">Next</span>
        </Button>

        {/* Last button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick$={() => handlePageChange(totalPages)}
            disabled={currentPageSignal.value === totalPages}
            aria-label="Go to last page"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}
      </nav>
    );
  }
);

type PaginationWithInfoProps = PaginationProps & {
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
};

export const PaginationWithInfo = component$<PaginationWithInfoProps>(
  ({ totalItems, itemsPerPage = 10, showInfo = true, ...paginationProps }) => {
    const startItem = (paginationProps.currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(
      paginationProps.currentPage * itemsPerPage,
      totalItems || 0
    );

    return (
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        {showInfo && totalItems && (
          <p class="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
        )}

        <Pagination {...paginationProps} />
      </div>
    );
  }
);

type SimplePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange$?: (page: number) => void;
  size?: "sm" | "default" | "lg";
  class?: string;
};

export const SimplePagination = component$<SimplePaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange$,
    size = "default",
    class: className,
  }) => {
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange$={onPageChange$}
        showFirstLast={false}
        showPageNumbers={false}
        size={size}
        class={className}
      />
    );
  }
);

type CompactPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange$?: (page: number) => void;
  size?: "sm" | "default" | "lg";
  class?: string;
};

export const CompactPagination = component$<CompactPaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange$,
    size = "default",
    class: className,
  }) => {
    return (
      <div class={cn("flex items-center space-x-2", className)}>
        <Button
          variant="outline"
          size={size}
          onClick$={() => onPageChange$?.(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <span class="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size={size}
          onClick$={() => onPageChange$?.(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  }
);
