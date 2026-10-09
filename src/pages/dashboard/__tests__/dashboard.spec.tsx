import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import Cards from '../cards';
import Dashboard from '../dashboard';

jest.mock('@/hooks/useStore');
jest.mock('@deriv-com/ui', () => ({ useDevice: jest.fn() }));
jest.mock('@/components/load-modal/google-drive', () => () => null);
jest.mock('@/components/shared_ui/dialog', () => () => null);
jest.mock('@/components/shared_ui/mobile-full-page-modal', () => () => null);
jest.mock('../bot-list/dashboard-bot-list', () => () => null);
jest.mock('../announcements', () => () => null);
jest.mock('../info-panel', () => () => null);
jest.mock('../../tutorials/dbot-tours/onboarding-tour', () => () => null);
jest.mock('@deriv/quill-icons/Illustration', () => ({
    DerivLightBotBuilderIcon: () => null,
    DerivLightGoogleDriveIcon: () => null,
    DerivLightLocalDeviceIcon: () => null,
    DerivLightMyComputerIcon: () => null,
    DerivLightQuickStrategyIcon: () => null,
}));

const createStore = () => ({
    dashboard: {
        active_tab: 0,
        active_tour: false,
        dialog_options: {},
        is_dialog_open: false,
        onCloseDialog: jest.fn(),
        setActiveTab: jest.fn(),
        setPreviewOnPopup: jest.fn(),
    },
    load_modal: {
        dashboard_strategies: [],
        toggleLoadModal: jest.fn(),
        setActiveTabIndex: jest.fn(),
    },
    quick_strategy: { setFormVisibility: jest.fn() },
    google_drive: { is_google_drive_configured: false },
    client: { is_logged_in: false },
});

describe('Dashboard starting points', () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        store = createStore();
        (useStore as jest.Mock).mockReturnValue(store);
        (useDevice as jest.Mock).mockReturnValue({ isDesktop: true, isTablet: false });
    });

    it('shows clear onboarding and opens the existing tutorials tab', async () => {
        render(<Dashboard handleTabChange={jest.fn()} />);
        expect(screen.getByRole('heading', { name: 'Build a bot. Make it yours.' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Choose your starting point' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /Explore tutorials/ }));
        expect(store.dashboard.setActiveTab).toHaveBeenCalledWith(DBOT_TABS.TUTORIAL);
    });

    it('keeps the welcome heading visible when saved strategies exist', () => {
        (useStore as jest.Mock).mockReturnValue({
            ...store,
            load_modal: { ...store.load_modal, dashboard_strategies: [{ id: 'saved-bot' }] },
        });
        render(<Dashboard handleTabChange={jest.fn()} />);
        expect(screen.getByRole('heading', { name: 'Your next strategy starts here.' })).toBeInTheDocument();
    });

    it('offers keyboard-operable actions with descriptive labels', async () => {
        render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        expect(screen.getAllByRole('button')).toHaveLength(3);
        await userEvent.tab();
        expect(screen.getByRole('button', { name: /My computer.*XML file/ })).toHaveFocus();
        await userEvent.keyboard('{Enter}');
        expect(store.load_modal.toggleLoadModal).toHaveBeenCalledTimes(1);
        expect(store.load_modal.setActiveTabIndex).toHaveBeenCalledWith(1);
        expect(store.dashboard.setActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER);
    });

    it('opens the builder from the entire card', async () => {
        render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        await userEvent.click(screen.getByText('Connect drag-and-drop blocks to build your own strategy.'));
        expect(store.dashboard.setActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER);
    });

    it('opens the quick strategy form', async () => {
        render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        await userEvent.click(screen.getByRole('button', { name: /Quick strategy/ }));
        expect(store.dashboard.setActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER);
        expect(store.quick_strategy.setFormVisibility).toHaveBeenCalledWith(true);
    });

    it('hides unconfigured Google Drive actions', () => {
        render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        expect(screen.queryByRole('button', { name: /Google Drive/ })).not.toBeInTheDocument();
    });

    it('opens Google Drive when configured', async () => {
        store.google_drive.is_google_drive_configured = true;
        render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        await userEvent.click(screen.getByRole('button', { name: /Google Drive/ }));
        expect(store.load_modal.toggleLoadModal).toHaveBeenCalledTimes(1);
        expect(store.load_modal.setActiveTabIndex).toHaveBeenCalledWith(2);
    });

    it('updates actions when switching to mobile without opening a dialog', async () => {
        const { rerender } = render(<Cards is_mobile={false} has_dashboard_strategies={false} />);
        (useDevice as jest.Mock).mockReturnValue({ isDesktop: false, isTablet: false });
        rerender(<Cards is_mobile has_dashboard_strategies={false} />);
        await userEvent.click(screen.getByRole('button', { name: /Local.*XML file/ }));
        expect(store.load_modal.setActiveTabIndex).toHaveBeenCalledWith(0);
    });

    it('opens the mobile Google Drive tab', async () => {
        store.google_drive.is_google_drive_configured = true;
        (useDevice as jest.Mock).mockReturnValue({ isDesktop: false, isTablet: false });
        render(<Cards is_mobile has_dashboard_strategies={false} />);
        await userEvent.click(screen.getByRole('button', { name: /Google Drive/ }));
        expect(store.load_modal.setActiveTabIndex).toHaveBeenCalledWith(1);
    });
});
