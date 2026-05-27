import type { WindowSettings } from '@mindwtr/core';

export type DesktopCloseBehavior = NonNullable<WindowSettings['closeBehavior']>;

export const getDefaultCloseBehavior = (isFlatpak: boolean): DesktopCloseBehavior => (
    isFlatpak ? 'tray' : 'ask'
);

export const resolveCloseBehavior = (
    closeBehavior: WindowSettings['closeBehavior'] | undefined,
    isFlatpak: boolean,
): DesktopCloseBehavior => closeBehavior ?? getDefaultCloseBehavior(isFlatpak);
