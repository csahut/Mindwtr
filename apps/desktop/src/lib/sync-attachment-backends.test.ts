import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '@mindwtr/core';

import { syncCloudAttachments, type AttachmentBackendDeps } from './sync-attachment-backends';

const fsMocks = vi.hoisted(() => ({
    BaseDirectory: { Data: 'Data' },
    exists: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    remove: vi.fn(),
    rename: vi.fn(),
    writeFile: vi.fn(),
}));

const pathMocks = vi.hoisted(() => ({
    dataDir: vi.fn(),
    join: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => fsMocks);
vi.mock('@tauri-apps/api/path', () => pathMocks);

const errorResponse = (status: number, statusText: string): Response => ({
    ok: false,
    status,
    statusText,
    headers: new Headers(),
    body: null,
    arrayBuffer: async () => new ArrayBuffer(0),
} as Response);

describe('desktop sync attachment backends', () => {
    it('marks cloud attachments unrecoverable when the remote file is missing', async () => {
        const fetcher = vi.fn(async () => errorResponse(404, 'Not Found'));
        const logSyncWarning = vi.fn();
        const appData: AppData = {
            tasks: [
                {
                    id: 'task-1',
                    title: 'Task',
                    status: 'next',
                    tags: [],
                    contexts: [],
                    attachments: [
                        {
                            id: 'attachment-1',
                            kind: 'file',
                            title: 'PXL_20260604_232051859.jpg',
                            uri: '',
                            cloudKey: 'attachments/attachment-1.jpg',
                            localStatus: 'missing',
                            fileHash: 'a'.repeat(64),
                            createdAt: '2026-06-07T00:00:00.000Z',
                            updatedAt: '2026-06-07T00:00:00.000Z',
                        },
                    ],
                    createdAt: '2026-06-07T00:00:00.000Z',
                    updatedAt: '2026-06-07T00:00:00.000Z',
                },
            ],
            projects: [],
            sections: [],
            areas: [],
            settings: {},
        };
        const deps: AttachmentBackendDeps = {
            getTauriFetch: async () => fetcher as unknown as typeof fetch,
            isTauriRuntimeEnv: () => true,
            logSyncInfo: vi.fn(),
            logSyncWarning,
            resolveWebdavPassword: vi.fn(),
        };

        pathMocks.dataDir.mockResolvedValue('/app-data');
        pathMocks.join.mockImplementation(async (...parts: string[]) => parts.join('/'));
        fsMocks.mkdir.mockResolvedValue(undefined);

        await expect(
            syncCloudAttachments(
                appData,
                { url: 'https://cloud.example/v1/data', token: 'token' },
                'https://cloud.example/v1',
                deps,
            ),
        ).resolves.toBe(true);

        const attachment = appData.tasks[0].attachments?.[0];
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(attachment?.cloudKey).toBeUndefined();
        expect(attachment?.fileHash).toBeUndefined();
        expect(attachment?.localStatus).toBe('missing');
        expect(attachment?.deletedAt).toBeDefined();
        expect(logSyncWarning).not.toHaveBeenCalledWith(
            expect.stringContaining('Failed to download attachment'),
            expect.anything(),
        );
    });
});
