import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettingsMainPage } from './useSettingsMainPage';

const getLaunchAtStartupEnabled = vi.fn();

vi.mock('@tauri-apps/api/app', () => ({
    setTheme: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../lib/launch-at-startup', () => ({
    getLaunchAtStartupEnabled: () => getLaunchAtStartupEnabled(),
    setLaunchAtStartupEnabled: vi.fn(),
}));

type HarnessProps = {
    isFlatpak: boolean;
    isTauri: boolean;
};

function Harness({ isFlatpak, isTauri }: HarnessProps) {
    const page = useSettingsMainPage({
        globalQuickAddShortcut: 'Control+Alt+M',
        isFlatpak,
        isLinux: true,
        isTauri,
        keybindingStyle: 'vim',
        language: 'en',
        openHelp: vi.fn(),
        setGlobalQuickAddShortcut: vi.fn(),
        setKeybindingStyle: vi.fn(),
        setLanguage: vi.fn(),
        settings: { window: { launchAtStartup: true } },
        showSaved: vi.fn(),
        updateSettings: vi.fn(),
    });

    return (
        <output data-testid="settings-main-state">
            {JSON.stringify({
                closeBehavior: page.closeBehavior,
                launchAtStartupEnabled: page.launchAtStartupEnabled,
                showCloseBehavior: page.showCloseBehavior,
                showLaunchAtStartup: page.showLaunchAtStartup,
                showTrayToggle: page.showTrayToggle,
            })}
        </output>
    );
}

const readState = () => JSON.parse(screen.getByTestId('settings-main-state').textContent ?? '{}');

describe('useSettingsMainPage', () => {
    beforeEach(() => {
        getLaunchAtStartupEnabled.mockClear();
    });

    it('exposes Flatpak lifecycle controls and defaults close handling to tray', () => {
        render(<Harness isFlatpak isTauri />);

        expect(readState()).toMatchObject({
            closeBehavior: 'tray',
            launchAtStartupEnabled: true,
            showCloseBehavior: true,
            showLaunchAtStartup: true,
            showTrayToggle: true,
        });
        expect(getLaunchAtStartupEnabled).not.toHaveBeenCalled();
    });

    it('keeps lifecycle controls hidden outside the Tauri runtime', () => {
        render(<Harness isFlatpak={false} isTauri={false} />);

        expect(readState()).toMatchObject({
            closeBehavior: 'ask',
            showCloseBehavior: false,
            showLaunchAtStartup: false,
            showTrayToggle: false,
        });
    });
});
