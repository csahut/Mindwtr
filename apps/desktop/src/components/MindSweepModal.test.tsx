import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { MindSweepLauncher } from './MindSweepModal';

const t = (key: string) => key;

const openFlow = (addTask = vi.fn().mockResolvedValue(undefined)) => {
    const utils = render(<MindSweepLauncher t={t} addTask={addTask} />);
    fireEvent.click(utils.getByRole('button', { name: 'mindSweep.launchButton' }));
    return { ...utils, addTask };
};

describe('MindSweepLauncher', () => {
    it('opens the intro step with scope choices', () => {
        const { getByText } = openFlow();
        expect(getByText('mindSweep.intro')).toBeInTheDocument();
        expect(getByText('mindSweep.scopePersonal')).toBeInTheDocument();
        expect(getByText('mindSweep.scopeWork')).toBeInTheDocument();
    });

    it('steps into the first group and captures items to the inbox', async () => {
        const { addTask, getByText, getByPlaceholderText } = openFlow();
        fireEvent.click(getByText('mindSweep.start'));

        expect(getByText('mindSweep.group.homeStuff.title')).toBeInTheDocument();
        expect(getByText('mindSweep.group.homeStuff.p1')).toBeInTheDocument();

        const input = getByPlaceholderText('mindSweep.inputPlaceholder');
        fireEvent.change(input, { target: { value: 'Fix the dripping tap' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(addTask).toHaveBeenCalledWith('Fix the dripping tap', { status: 'inbox' });
        });
        expect(getByText('Fix the dripping tap')).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe('');
    });

    it('filters groups by scope and reaches the summary with a count', async () => {
        const { getByText, getByPlaceholderText, queryByText } = openFlow();
        fireEvent.click(getByText('mindSweep.scopeWork'));
        fireEvent.click(getByText('mindSweep.start'));

        // First work group, not a personal one.
        expect(getByText('mindSweep.group.commitments.title')).toBeInTheDocument();
        expect(queryByText('mindSweep.group.homeStuff.title')).toBeNull();

        const input = getByPlaceholderText('mindSweep.inputPlaceholder');
        fireEvent.change(input, { target: { value: 'Reply to the vendor' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(getByText('Reply to the vendor')).toBeInTheDocument());

        // 4 work groups -> press next 4 times to land on the summary.
        fireEvent.click(getByText('mindSweep.next'));
        fireEvent.click(getByText('mindSweep.next'));
        fireEvent.click(getByText('mindSweep.next'));
        fireEvent.click(getByText('mindSweep.next'));
        expect(getByText('mindSweep.summaryTitle')).toBeInTheDocument();
        // With t = (key) => key the count template renders as the literal key.
        expect(getByText('mindSweep.summaryCount')).toBeInTheDocument();
    });
});
