import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { TaskListHeader } from './TaskListHeader';

vi.mock('react-native', () => ({
  ScrollView: ({ children, contentContainerStyle, horizontal, showsHorizontalScrollIndicator, style, ...props }: any) =>
    React.createElement('div', props, children),
  StyleSheet: { create: (styles: any) => styles },
  Text: ({ accessibilityLabel, accessibilityRole, numberOfLines, ...props }: any) =>
    React.createElement('span', { ...props, 'aria-label': accessibilityLabel, role: accessibilityRole }, props.children),
  TouchableOpacity: ({ accessibilityLabel, accessibilityRole, hitSlop, onPress, style, ...props }: any) =>
    React.createElement('button', { ...props, 'aria-label': accessibilityLabel, role: accessibilityRole, onClick: onPress }, props.children),
  View: ({ accessibilityLabel, accessibilityRole, style, ...props }: any) =>
    React.createElement('div', { ...props, 'aria-label': accessibilityLabel, role: accessibilityRole }, props.children),
}));

vi.mock('lucide-react-native', () => ({
  SlidersHorizontal: () => React.createElement('span', { 'data-icon': 'sliders-horizontal' }),
}));

const themeColors = {
  border: '#d1d5db',
  cardBg: '#ffffff',
  filterBg: '#f3f4f6',
  onTint: '#ffffff',
  secondaryText: '#6b7280',
  text: '#111827',
  tint: '#2563eb',
};

const renderHeader = (overrides: Partial<React.ComponentProps<typeof TaskListHeader>> = {}) => renderToStaticMarkup(
  <TaskListHeader
    count={3}
    enableBulkActions={false}
    hasActiveTimeEstimateFilters={false}
    onOpenSort={vi.fn()}
    onToggleSelectionMode={vi.fn()}
    selectedTimeEstimates={[]}
    selectionMode={false}
    setTimeEstimates={vi.fn()}
    showHeader={false}
    showSort
    showTimeEstimateFilters={false}
    sortByLabel="Created (newest)"
    t={(key) => ({ 'common.tasks': 'tasks', 'sort.label': 'Sort' }[key] ?? key)}
    themeColors={themeColors}
    title="Inbox"
    toggleTimeEstimate={vi.fn()}
    {...overrides}
  />
);

describe('TaskListHeader', () => {
  it('keeps the sort control visible for compact headerless task lists', () => {
    const html = renderHeader();

    expect(html).toContain('aria-label="Sort: Created (newest)"');
    expect(html).toContain('data-icon="sliders-horizontal"');
    expect(html).not.toContain('Inbox');
  });

  it('omits the compact accessory row when sorting and accessories are disabled', () => {
    const html = renderHeader({ showSort: false });

    expect(html).not.toContain('aria-label="Sort');
    expect(html).not.toContain('data-icon="sliders-horizontal"');
  });
});
