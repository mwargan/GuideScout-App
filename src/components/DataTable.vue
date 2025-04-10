<script lang="ts" setup>
import { type PropType, computed, h, ref } from "vue";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  FlexRender,
  type SortingState,
  type VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { relativeTime } from "@/helpers/relativeRealtime";
import BaseButton from "./BaseButton.vue";

interface ColumnType {
  value: string | ColumnDef<any, any>;
  type: "string" | "date" | "img" | "raw";
}

const props = defineProps({
  columns: {
    type: Array as PropType<ColumnType[]>,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});
const columnHelper = createColumnHelper<any>();

const headerFunction = (column: Column<any>) => {
  return h(
    BaseButton,
    {
      onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    },
    () => [column.id, h("span", { class: "ml-2 h-4 w-4" })]
  );
};

const allColumns = computed(() => {
  return props.columns.map((column) => {
    // If the column is an instance of ColumnDef, use it directly
    if (column.value instanceof Object) {
      return column.value;
    }
    if (column.type === "string") {
      return columnHelper.accessor(column.value, {
        header: ({ column }) => headerFunction(column),
        cell: (info) => info.getValue() ?? "-",
      });
    } else if (column.type === "date") {
      return columnHelper.accessor(column.value, {
        header: ({ column }) => headerFunction(column),
        cell: (info) => {
          return info.getValue() ? relativeTime(info.getValue()) : "";
        },
      });
    } else if (column.type === "img") {
      return columnHelper.accessor(column.value, {
        cell: (info) => {
          return h("img", {
            src: info.getValue(),
            alt: "Image",
          });
        },
      });
    }
  });
});

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  // @ts-ignore
  get columns() {
    return allColumns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  // getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => {
    if (updaterOrValue instanceof Function) {
      sorting.value = updaterOrValue(sorting.value);
    } else {
      sorting.value = updaterOrValue;
    }
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
});

// We need to watch the columns and trigger an update to the table
// when they change
</script>

<template>
  <div class="overflow-auto">
    <table>
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
          >
            <!-- Handles all possible header column def scenarios for `header` -->
            <FlexRender
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
