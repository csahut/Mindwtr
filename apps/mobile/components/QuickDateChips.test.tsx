import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import { QuickDateChips } from './QuickDateChips';

const flattenStyle = (value: any): Record<string, unknown> => (
  Array.isArray(value)
    ? Object.assign({}, ...value.map(flattenStyle))
    : value
);

const tc = {
  cardBg: '#111',
  border: '#333',
  filterBg: '#222',
  inputBg: '#111',
  secondaryText: '#aaa',
  text: '#fff',
  tint: '#3b82f6',
  onTint: '#fff',
};

const t = (key: string) => ({
  'quickDate.today': 'Today',
  'quickDate.tomorrow': 'Tomorrow',
  'quickDate.in3Days': '+3 days',
  'quickDate.nextWeek': 'Next week',
  'quickDate.nextMonth': 'Next month',
  'quickDate.noDate': 'No date',
}[key] ?? key);

describe('QuickDateChips', () => {
  it('wraps quick date pills instead of clipping them horizontally', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <QuickDateChips
          t={t}
          tc={tc as any}
          selectedDate={null}
          onSelect={vi.fn()}
        />
      );
    });

    const row = tree.root.findByProps({ testID: 'quick-date-chips-row' });
    expect(flattenStyle(row.props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
    });

    const labels = tree.root.findAllByType(Text).map((node) => node.props.children);
    expect(labels).toContain('Next month');
  });
});
