import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import Announcements from './announcements';
import Cards from './cards';
import InfoPanel from './info-panel';

type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};

const DashboardComponent = observer(({ handleTabChange }: TMobileIconGuide) => {
    const { load_modal, dashboard, client, google_drive } = useStore();
    const { dashboard_strategies } = load_modal;
    const { is_google_drive_configured } = google_drive;
    const { active_tab, active_tour, setActiveTab } = dashboard;
    const has_dashboard_strategies = !!dashboard_strategies?.length;
    const { isDesktop, isTablet } = useDevice();

    return (
        <React.Fragment>
            <div
                className={classNames('tab__dashboard', {
                    'tab__dashboard--tour-active': active_tour,
                })}
            >
                <div className='tab__dashboard__content'>
                    {client.is_logged_in && (
                        <Announcements is_mobile={!isDesktop} is_tablet={isTablet} handleTabChange={handleTabChange} />
                    )}
                    <div className='quick-panel'>
                        <div
                            className={classNames('tab__dashboard__header', {
                                'tab__dashboard__header--listed': isDesktop && has_dashboard_strategies,
                            })}
                        >
                            <div className='dashboard-intro'>
                                <div className='dashboard-intro__copy'>
                                    <span className='dashboard-intro__eyebrow'>
                                        {localize('Your trading workspace')}
                                    </span>
                                    <Text
                                        className='title'
                                        as='h2'
                                        color='prominent'
                                        size={isDesktop ? 'sm' : 's'}
                                        lineHeight='xxl'
                                        weight='bold'
                                    >
                                        {has_dashboard_strategies
                                            ? localize('Your next strategy starts here.')
                                            : localize('Build a bot. Make it yours.')}
                                    </Text>
                                    <Text
                                        as='p'
                                        color='prominent'
                                        lineHeight='s'
                                        size={isDesktop ? 's' : 'xxs'}
                                        className={classNames('subtitle', {
                                            'subtitle__has-list': has_dashboard_strategies,
                                        })}
                                    >
                                        {is_google_drive_configured
                                            ? localize(
                                                  'Import a bot from your computer or Google Drive, build it from scratch, or start with a quick strategy.'
                                              )
                                            : localize(
                                                  'Import a bot from your computer, build it from scratch, or start with a quick strategy.'
                                              )}
                                    </Text>
                                </div>
                                <aside className='dashboard-intro__guide'>
                                    <span className='dashboard-intro__guide-label'>
                                        {localize('New to bot building?')}
                                    </span>
                                    <p>{localize('Get to know the tools, then put your ideas into practice.')}</p>
                                    <button type='button' onClick={() => setActiveTab(DBOT_TABS.TUTORIAL)}>
                                        {localize('Explore tutorials')}
                                        <span aria-hidden='true'>↗</span>
                                    </button>
                                </aside>
                            </div>
                        </div>
                        <div className='dashboard-section-heading'>
                            <h3>{localize('Choose your starting point')}</h3>
                            <span>{localize('Create, customise, or pick up where you left off.')}</span>
                        </div>
                        <Cards has_dashboard_strategies={has_dashboard_strategies} is_mobile={!isDesktop} />
                        <p className='dashboard-practice-note'>
                            {localize('Start on a demo account to explore your strategy. Trading involves risk.')}
                        </p>
                    </div>
                </div>
            </div>
            <InfoPanel />
            {active_tab === 0 && <OnboardTourHandler is_mobile={!isDesktop} />}
        </React.Fragment>
    );
});

export default DashboardComponent;
