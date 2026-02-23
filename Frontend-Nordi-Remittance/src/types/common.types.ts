// ============================================================================
// COMMON TYPES - Shared utility types used across the application
// ============================================================================

import { ReactNode } from 'react';

declare global {
  // ========================
  // GENERIC UTILITY TYPES
  // ========================
  
  /** Make specific properties optional */
  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  
  /** Make specific properties required */
  type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
  
  /** Extract the type of array elements */
  type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
  
  /** Make all properties deeply partial */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  
  /** Make all properties deeply required */
  type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
  };
  
  /** Extract keys of a type that match a value type */
  type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
  }[keyof T];
  
  /** Async function type */
  type AsyncFunction<T = void> = () => Promise<T>;
  
  /** Callback function with optional error */
  type Callback<T = void> = (error?: Error | null, result?: T) => void;
  
  // ========================
  // CHILDREN PROPS
  // ========================
  
  interface ChildrenProps {
    children: ReactNode;
  }
  
  interface OptionalChildrenProps {
    children?: ReactNode;
  }
  
  // ========================
  // CLASS NAME PROPS
  // ========================
  
  interface ClassNameProps {
    className?: string;
  }
  
  interface WithClassName {
    className?: string;
  }
  
  // ========================
  // BASE COMPONENT PROPS
  // ========================
  
  interface BaseComponentProps extends ClassNameProps, OptionalChildrenProps {}
  
  interface BaseProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    'data-testid'?: string;
  }
  
  // ========================
  // ICON PROPS
  // ========================
  
  interface IconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }
  
  // ========================
  // SIZE VARIANTS
  // ========================
  
  type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type CompactSize = 'sm' | 'md' | 'lg';
  
  // ========================
  // STATUS TYPES
  // ========================
  
  type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';
  type LoadingState = 'idle' | 'loading' | 'success' | 'error';
  
  // ========================
  // EVENT HANDLER TYPES
  // ========================
  
  type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
  type ChangeHandler<T = string> = (value: T) => void;
  type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>;
  type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
  type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;
  
  // ========================
  // DATA STRUCTURE TYPES
  // ========================
  
  interface KeyValue<T = string> {
    key: string;
    value: T;
  }
  
  interface LabelValue<T = string> {
    label: string;
    value: T;
  }
  
  interface NameValue<T = string> {
    name: string;
    value: T;
  }
  
  interface IdName {
    id: string;
    name: string;
  }
  
  interface IdLabel {
    id: string;
    label: string;
  }
  
  // ========================
  // PAGINATION TYPES
  // ========================
  
  interface PaginationParams {
    page: number;
    limit: number;
  }
  
  interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  
  interface PaginatedData<T> {
    data: T[];
    meta: PaginationMeta;
  }
  
  // ========================
  // SORTING & FILTERING
  // ========================
  
  type SortDirection = 'asc' | 'desc';
  
  interface SortConfig<T = string> {
    field: T;
    direction: SortDirection;
  }
  
  interface FilterConfig<T = unknown> {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
    value: T;
  }
  
  // ========================
  // DATE/TIME TYPES
  // ========================
  
  interface DateRange {
    startDate: Date | string;
    endDate: Date | string;
  }
  
  interface TimeRange {
    startTime: string;
    endTime: string;
  }
  
  // ========================
  // COORDINATES
  // ========================
  
  interface Coordinates {
    lat: number;
    lng: number;
  }
  
  interface Position {
    x: number;
    y: number;
  }
  
  interface Dimensions {
    width: number;
    height: number;
  }
  
  interface BoundingBox extends Position, Dimensions {}
  
  // ========================
  // RESPONSIVE TYPES
  // ========================
  
  type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
  
  // ========================
  // THEME TYPES
  // ========================
  
  type ThemeMode = 'light' | 'dark' | 'system';
  type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
}
export {};
