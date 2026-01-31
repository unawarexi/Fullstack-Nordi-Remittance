// ============================================================================
// COMMON TYPES - Shared utility types used across the application
// ============================================================================

import { ReactNode } from 'react';

// ========================
// GENERIC UTILITY TYPES
// ========================

/** Make specific properties optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific properties required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extract the type of array elements */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/** Make all properties deeply partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Make all properties deeply required */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/** Extract keys of a type that match a value type */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/** Async function type */
export type AsyncFunction<T = void> = () => Promise<T>;

/** Callback function with optional error */
export type Callback<T = void> = (error?: Error | null, result?: T) => void;

// ========================
// CHILDREN PROPS
// ========================

export interface ChildrenProps {
  children: ReactNode;
}

export interface OptionalChildrenProps {
  children?: ReactNode;
}

// ========================
// CLASS NAME PROPS
// ========================

export interface ClassNameProps {
  className?: string;
}

export interface WithClassName {
  className?: string;
}

// ========================
// BASE COMPONENT PROPS
// ========================

export interface BaseComponentProps extends ClassNameProps, OptionalChildrenProps {}

export interface BaseProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// ========================
// ICON PROPS
// ========================

export interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

// ========================
// SIZE VARIANTS
// ========================

export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CompactSize = 'sm' | 'md' | 'lg';

// ========================
// STATUS TYPES
// ========================

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ========================
// EVENT HANDLER TYPES
// ========================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;

// ========================
// DATA STRUCTURE TYPES
// ========================

export interface KeyValue<T = string> {
  key: string;
  value: T;
}

export interface LabelValue<T = string> {
  label: string;
  value: T;
}

export interface NameValue<T = string> {
  name: string;
  value: T;
}

export interface IdName {
  id: string;
  name: string;
}

export interface IdLabel {
  id: string;
  label: string;
}

// ========================
// PAGINATION TYPES
// ========================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

// ========================
// SORTING & FILTERING
// ========================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = string> {
  field: T;
  direction: SortDirection;
}

export interface FilterConfig<T = unknown> {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: T;
}

// ========================
// DATE/TIME TYPES
// ========================

export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

// ========================
// COORDINATES
// ========================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface BoundingBox extends Position, Dimensions {}

// ========================
// RESPONSIVE TYPES
// ========================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ========================
// THEME TYPES
// ========================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
