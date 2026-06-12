import React from 'react';
import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '@mindwtr/core';

import { useTaskDescriptionEditor, type TaskDescriptionEditor } from './use-task-description-editor';

type HarnessApi = {
  draft: string;
  editor: TaskDescriptionEditor;
};

const task: Task = {
  id: 'task-1',
  title: 'Task',
  status: 'inbox',
  tags: [],
  contexts: [],
  createdAt: '2026-06-12T00:00:00.000Z',
  updatedAt: '2026-06-12T00:00:00.000Z',
};

function DescriptionEditorHarness({
  expose,
}: {
  expose: React.MutableRefObject<HarnessApi | null>;
}) {
  const [descriptionDraft, setDescriptionDraft] = React.useState('');
  const descriptionDraftRef = React.useRef(descriptionDraft);
  const descriptionDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const editor = useTaskDescriptionEditor({
    task,
    descriptionDraft,
    descriptionDraftRef,
    setDescriptionDraft,
    descriptionDebounceRef,
    setEditedTask: vi.fn(),
    resetCopilotDraft: vi.fn(),
    onMarkdownOverlayVisibilityChange: vi.fn(),
    onInputFocusTracked: vi.fn(),
  });

  expose.current = {
    draft: descriptionDraft,
    editor,
  };

  return null;
}

describe('useTaskDescriptionEditor', () => {
  it('keeps inline Android description pairs through repeated stale native changes', () => {
    const expose = React.createRef<HarnessApi | null>();
    let tree!: ReturnType<typeof create>;

    act(() => {
      tree = create(<DescriptionEditorHarness expose={expose} />);
    });

    const preventDefault = vi.fn();
    act(() => {
      expose.current!.editor.handleDescriptionKeyPress({
        nativeEvent: { key: '(' },
        preventDefault,
      } as any);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(expose.current!.draft).toBe('()');

    act(() => {
      expose.current!.editor.handleDescriptionChange('(');
    });

    expect(expose.current!.draft).toBe('()');

    act(() => {
      expose.current!.editor.handleDescriptionChange('(())');
    });

    expect(expose.current!.draft).toBe('()');

    act(() => {
      tree.unmount();
    });
  });
});
