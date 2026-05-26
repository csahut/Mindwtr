import React from 'react';
import { Pressable } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { MARKDOWN_TOOLBAR_ACTIONS } from '@mindwtr/core';
import { describe, expect, it, vi } from 'vitest';

import { MarkdownFormatToolbar } from './markdown-format-toolbar';

vi.mock('@expo/vector-icons', () => ({
    Ionicons: (props: any) => React.createElement('Ionicons', props),
}));

const themeColors = {
    bg: '#ffffff',
    cardBg: '#ffffff',
    taskItemBg: '#ffffff',
    inputBg: '#ffffff',
    filterBg: '#f2f2f7',
    border: '#d1d5db',
    text: '#111827',
    secondaryText: '#6b7280',
    icon: '#6b7280',
    tint: '#2563eb',
    onTint: '#ffffff',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#2563eb',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
};

const baseProps = {
    selection: { start: 0, end: 0 },
    onSelectionChange: vi.fn(),
    inputRef: { current: null },
    t: (key: string) => key,
    tc: themeColors,
    visible: true,
    canUndo: false,
    onUndo: vi.fn(),
    onApplyAction: vi.fn(() => ({ value: '', selection: { start: 0, end: 0 } })),
};

describe('MarkdownFormatToolbar', () => {
    it('renders inline without waiting for keyboard metrics', () => {
        let tree: ReactTestRenderer | undefined;
        act(() => {
            tree = create(<MarkdownFormatToolbar {...baseProps} placement="inline" />);
        });

        expect(tree!.root.findAllByType(Pressable)).toHaveLength(MARKDOWN_TOOLBAR_ACTIONS.length + 1);
    });

    it('keeps keyboard placement hidden until the keyboard inset is known', () => {
        let tree: ReactTestRenderer | undefined;
        act(() => {
            tree = create(<MarkdownFormatToolbar {...baseProps} />);
        });

        expect(tree!.root.findAllByType(Pressable)).toHaveLength(0);
    });
});
