import {
  component$,
  type QwikIntrinsicElements,
  type JSXOutput,
  Slot,
  useSignal,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type TableProps = QwikIntrinsicElements["table"];

export const Table = component$<TableProps>(
  ({ class: className, ...props }) => {
    return (
      <div class="relative w-full overflow-auto">
        <table
          class={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          <Slot />
        </table>
      </div>
    );
  }
);

type TableHeaderProps = QwikIntrinsicElements["thead"];

export const TableHeader = component$<TableHeaderProps>(
  ({ class: className, ...props }) => {
    return (
      <thead class={cn("[&_tr]:border-b", className)} {...props}>
        <Slot />
      </thead>
    );
  }
);

type TableBodyProps = QwikIntrinsicElements["tbody"];

export const TableBody = component$<TableBodyProps>(
  ({ class: className, ...props }) => {
    return (
      <tbody class={cn("[&_tr:last-child]:border-0", className)} {...props}>
        <Slot />
      </tbody>
    );
  }
);

type TableFooterProps = QwikIntrinsicElements["tfoot"];

export const TableFooter = component$<TableFooterProps>(
  ({ class: className, ...props }) => {
    return (
      <tfoot
        class={cn(
          "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
          className
        )}
        {...props}
      >
        <Slot />
      </tfoot>
    );
  }
);

type TableRowProps = QwikIntrinsicElements["tr"];

export const TableRow = component$<TableRowProps>(
  ({ class: className, ...props }) => {
    return (
      <tr
        class={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        )}
        {...props}
      >
        <Slot />
      </tr>
    );
  }
);

type TableHeadProps = QwikIntrinsicElements["th"];

export const TableHead = component$<TableHeadProps>(
  ({ class: className, ...props }) => {
    return (
      <th
        class={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        <Slot />
      </th>
    );
  }
);

type TableCellProps = QwikIntrinsicElements["td"];

export const TableCell = component$<TableCellProps>(
  ({ class: className, ...props }) => {
    return (
      <td
        class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
      >
        <Slot />
      </td>
    );
  }
);

type TableCaptionProps = QwikIntrinsicElements["caption"];

export const TableCaption = component$<TableCaptionProps>(
  ({ class: className, ...props }) => {
    return (
      <caption
        class={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
      >
        <Slot />
      </caption>
    );
  }
);

// Sortable Table Components
type SortableTableHeadProps = TableHeadProps & {
  sortKey?: string;
  sortDirection?: "asc" | "desc" | null;
  onSort$?: (key: string) => void;
};

export const SortableTableHead = component$<SortableTableHeadProps>(
  ({ sortKey, sortDirection, onSort$, class: className, ...props }) => {
    const handleClick = $(() => {
      if (sortKey && onSort$) {
        onSort$(sortKey);
      }
    });

    return (
      <th
        class={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:bg-muted/50 [&:has([role=checkbox])]:pr-0",
          sortDirection && "bg-muted/30",
          className
        )}
        onClick$={handleClick}
        {...props}
      >
        <div class="flex items-center gap-2">
          <Slot />
          {sortDirection && (
            <svg
              class={cn(
                "h-4 w-4 transition-transform",
                sortDirection === "desc" && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          )}
        </div>
      </th>
    );
  }
);

// Enhanced Table with built-in sorting
type DataTableProps<T> = {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    sortable?: boolean;
    render?: (value: T[keyof T], row: T) => JSXOutput;
  }[];
  class?: string;
  emptyMessage?: string;
};

export const DataTable = component$<DataTableProps<Record<string, string | number | boolean | Date>>>(
  ({ data, columns, class: className, emptyMessage = "No data available" }) => {
    const sortConfig = useSignal<{
      key: string;
      direction: "asc" | "desc";
    } | null>(null);

    const sortedData = data.slice().sort((a, b) => {
      if (!sortConfig.value) return 0;

      const { key, direction } = sortConfig.value;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    const handleSort = $((key: string) => {
      if (sortConfig.value?.key === key) {
        // Toggle direction or reset
        if (sortConfig.value.direction === "asc") {
          sortConfig.value = { key, direction: "desc" };
        } else {
          sortConfig.value = null;
        }
      } else {
        sortConfig.value = { key, direction: "asc" };
      }
    });

    if (data.length === 0) {
      return (
        <div class={cn("text-center py-8 text-muted-foreground", className)}>
          {emptyMessage}
        </div>
      );
    }

    return (
      <Table class={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <SortableTableHead
                key={String(column.key)}
                sortKey={column.sortable ? String(column.key) : undefined}
                sortDirection={
                  sortConfig.value?.key === String(column.key)
                    ? sortConfig.value.direction
                    : null
                }
                onSort$={column.sortable ? handleSort : undefined}
              >
                {column.header}
              </SortableTableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);
