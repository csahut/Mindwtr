import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { act, create } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeedbackSettingsModal } from './feedback-settings-modal';
import { styles } from './settings.styles';

vi.mock('lucide-react-native', () => ({
  Bug: () => null,
  Lightbulb: () => null,
  MessageSquare: () => null,
  X: () => null,
}));

vi.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    bg: '#0f172a',
    cardBg: '#111827',
    border: '#334155',
    danger: '#ef4444',
    onTint: '#ffffff',
    secondaryText: '#94a3b8',
    success: '#22c55e',
    text: '#f8fafc',
    tint: '#3b82f6',
  }),
}));

const originalPlatformOs = Platform.OS;

const setPlatform = (os: typeof Platform.OS) => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
};

const tr = (key: string) => ({
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'settings.feedback': 'Send feedback',
  'settings.feedbackCategory': 'Category',
  'settings.feedbackCategoryBug': 'Bug report',
  'settings.feedbackCategoryFeature': 'Feature request',
  'settings.feedbackCategoryOther': 'Other',
  'settings.feedbackDesc': 'Report a bug or suggest a feature. No account needed.',
  'settings.feedbackEmail': 'Reply email (optional)',
  'settings.feedbackEmailPlaceholder': 'you@example.com',
  'settings.feedbackFailed': 'Feedback failed',
  'settings.feedbackIncludeDiagnostics': 'Include recent diagnostics',
  'settings.feedbackIncludeDiagnosticsDesc': 'Adds recent sanitized app logs.',
  'settings.feedbackInvalidEmail': 'Enter a valid email.',
  'settings.feedbackMessage': 'Message',
  'settings.feedbackMessagePlaceholder': 'Tell us what happened or what would help.',
  'settings.feedbackPrivacy': 'Task content is not attached.',
  'settings.feedbackRequired': 'Enter a message.',
  'settings.feedbackSending': 'Sending...',
  'settings.feedbackSent': 'Thanks for the feedback.',
  'settings.feedbackSubmit': 'Send feedback',
  'settings.feedbackUnavailable': 'Feedback is not configured in this build.',
}[key] ?? key);

describe('FeedbackSettingsModal', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatformOs,
    });
  });

  it('keeps Android modal scrolling under app control', () => {
    setPlatform('android');
    let tree!: ReturnType<typeof create>;

    act(() => {
      tree = create(
        <FeedbackSettingsModal
          visible
          isConfigured
          tr={tr}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />,
      );
    });

    expect(tree.root.findByType(KeyboardAvoidingView).props.behavior).toBe('height');
    expect(tree.root.findByType(ScrollView).props.keyboardDismissMode).toBe('on-drag');
    expect(tree.root.findByType(ScrollView).props.scrollsChildToFocus).toBe(false);
    expect(tree.root.findByType(ScrollView).props.nestedScrollEnabled).toBe(true);

    const backdropPressables = tree.root.findAllByType(Pressable);
    expect(backdropPressables).toHaveLength(1);
    expect(backdropPressables[0].props.style).toBe(styles.feedbackModalBackdropPressable);
  });
});
