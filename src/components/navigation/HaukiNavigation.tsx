import React from 'react';
import { useHistory } from 'react-router-dom';
import { IconCrossCircleFill, IconUser, Navigation } from 'hds-react';
import api from '../../common/utils/api/api';
import { useAppContext } from '../../App-context';
import { AuthContextProps, TokenKeys, useAuth } from '../../auth/auth-context';
import './HaukiNavigation.scss';
import { SecondaryButton } from '../button/Button';
import toast from '../notification/Toast';
import { Language } from '../../common/lib/types';
import LanguageSelect from '../language-select/LanguageSelect';

type Props = {
  language: Language;
  onLanguageChanged: (language: Language) => void;
};

export default function HaukiNavigation({
  language,
  onLanguageChanged,
}: Props): JSX.Element {
  const { hasOpenerWindow, closeAppWindow } = useAppContext();
  const authProps: Partial<AuthContextProps> = useAuth();
  const { authTokens, clearAuth } = authProps;
  const history = useHistory();
  const isAuthenticated = !!authTokens;

  const showSignOutErrorNotification = (text: string): void =>
    toast.error({
      label: 'Uloskirjautuminen epäonnistui',
      text,
    });

  const signOut = async (): Promise<void> => {
    try {
      const isAuthInvalidated = await api.invalidateAuth();
      if (isAuthInvalidated) {
        if (clearAuth) {
          clearAuth();
        }
        history.push('/');
      } else {
        showSignOutErrorNotification('Uloskirjautuminen hylättiin.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Sign out failed:', (e as Error).message);
      showSignOutErrorNotification(
        `Uloskirjautuminen epäonnistui. Yritä myöhemmin uudestaan. Virhe: ${e}`
      );
    }
  };

  const onCloseButtonClick = async (): Promise<void> => {
    if (isAuthenticated) {
      await signOut();
    }

    if (hasOpenerWindow && closeAppWindow) {
      closeAppWindow();
    }
  };

  return (
    <Navigation
      theme={{
        '--header-background-color': 'var(--hauki-header-background-color)',
        '--header-color': 'var(--hauki-header-color)',
        '--mobile-menu-color': 'var(--hauki-header-color)',
        '--mobile-menu-background-color':
          'var(--hauki-header-background-color)',
      }}
      title="Aukiolot"
      menuToggleAriaLabel="Menu"
      skipTo="#main"
      skipToContentLabel="Siirry pääsisältöön">
      {isAuthenticated && (
        <Navigation.Actions>
          <Navigation.Item as="div">
            <div className="navigation-user">
              <IconUser aria-hidden />
              <span className="navigation-user-name">
                {authTokens && authTokens[TokenKeys.usernameKey]}
              </span>
            </div>
          </Navigation.Item>
          <LanguageSelect
            id="language-select"
            label="Sivun kielivalinta"
            selectedLanguage={language}
            onSelect={onLanguageChanged}
          />
          <SecondaryButton
            dataTest="close-app-button"
            className="navigation-button"
            iconRight={<IconCrossCircleFill aria-hidden />}
            onClick={(): Promise<void> => onCloseButtonClick()}
            variant="secondary"
            light>
            Sulje
          </SecondaryButton>
        </Navigation.Actions>
      )}
    </Navigation>
  );
}
