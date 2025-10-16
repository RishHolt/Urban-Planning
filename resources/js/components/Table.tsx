import React, { useState, useMemo } from "react";
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ArrowDownUp, Search, Filter, MoreHorizontal, Check } from "lucide-react";
import Pagination from "./Pagination";
import { Input, Button, Badge, Checkbox, Select } from "./index";

interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: Array<{ value: any; label: string }>;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  loading?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  className = "",
  loading = false,
  sortable = true,
  filterable = false,
  selectable = false,
  onSort,
  onFilter,
  onSelectionChange,
  onRowClick,
  pagination,
  emptyState,
  stickyHeader = false,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const direction = sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key: columnKey, direction };
    
    setSortConfig(newSortConfig);
    onSort?.(columnKey, direction);
  };

  // Handle filtering
  const handleFilter = (columnKey: string, value: any) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Handle row selection
  const handleRowSelect = (row: T, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedRows, row];
      setSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = selectedRows.filter(item => item !== row);
      setSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows([...data]);
      onSelectionChange?.([...data]);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Filter Bar */}
      {filterable && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              rightIcon={<Filter size={16} />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <div key={column.key as string}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label}
                    </label>
                    {column.filterType === 'select' ? (
                      <Select
                        options={column.filterOptions || []}
                        value={filters[column.key as string] || ''}
                        onChange={(value) => handleFilter(column.key as string, value)}
                        placeholder={`Filter by ${column.label}`}
                        size="sm"
                      />
                    ) : (
                      <Input
                        type={column.filterType || 'text'}
                        value={filters[column.key as string] || ''}
                        onChange={(e) => handleFilter(column.key as string, e.target.value)}
                        placeholder={`Filter by ${column.label}`}
                        size="sm"
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <Checkbox
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={column.key as string}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${getAlignmentClass(column.align)}`}
                    onClick={() => column.sortable && sortable && handleSort(column.key as string)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpWideNarrow size={14} className="text-gray-400" />
                            ) : (
                              <ArrowDownNarrowWide size={14} className="text-gray-400" />
                            )
                          ) : (
                            <ArrowDownUp size={14} className="text-gray-300" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                    {emptyState || 'No data available'}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedRows.includes(row)}
                          onChange={(checked) => handleRowSelect(row, checked)}
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.key as string}
                        className={`px-6 py-4 text-sm text-gray-900 ${getAlignmentClass(column.align)} ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(row[column.key as keyof T], row, index)
                          : row[column.key as keyof T]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Table;