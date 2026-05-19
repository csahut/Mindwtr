import { Platform } from 'react-native';
import type { MarkdownSelection } from '@mindwtr/core';

export function getControlledTextInputSelection(selection: MarkdownSelection): MarkdownSelection | undefined {
  // Android TextInput can fight native cursor movement when selection is controlled on every render.
  return Platform.OS === 'android' ? undefined : selection;
}
