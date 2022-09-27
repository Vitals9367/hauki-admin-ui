import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IconCrossCircleFill,
  IconQuestionCircle,
  IconUser,
  Navigation,
} from 'hds-react';
import api from '../../common/utils/api/api';
import { useAppContext } from '../../App-context';
import { AuthContextProps, TokenKeys, useAuth } from '../../auth/auth-context';
import './HaukiNavigation.scss';
import { SecondaryButton } from '../button/Button';
import toast from '../notification/Toast';
import LanguageSelect from '../language-select/LanguageSelect';

export default function HaukiNavigation(): JSX.Element {
  const {
    hasOpenerWindow,
    closeAppWindow,
    language,
    setLanguage,
  } = useAppContext();
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
        '--header-focus-outline-color': 'var(--color-white)',
        '--mobile-menu-color': 'var(--hauki-header-color)',
        '--mobile-menu-background-color':
          'var(--hauki-header-background-color)',
      }}
      title="Aukiolot"
      menuToggleAriaLabel="Menu"
      skipTo="#main"
      skipToContentLabel="Siirry pääsisältöön">
      <Navigation.Actions>
        <a
          className="instructions-link"
          href="https://kaupunkialustana.hel.fi/aukiolosovellus-ohje/"
          target="_blank"
          rel="noreferrer">
          <IconQuestionCircle /> Ohje
        </a>
        {isAuthenticated && (
          <>
            <Navigation.Item as="div">
              <div className="navigation-user">
                <IconUser aria-hidden />
                <span className="navigation-user-name">
                  {authTokens && authTokens[TokenKeys.usernameKey]}
                </span>
              </div>
            </Navigation.Item>
            {language && setLanguage && (
              <LanguageSelect
                id="language-select"
                label="Sivun kielivalinta"
                selectedLanguage={language}
                onSelect={setLanguage}
              />
            )}
            <SecondaryButton
              dataTest="close-app-button"
              className="navigation-button"
              iconRight={<IconCrossCircleFill aria-hidden />}
              onClick={(): Promise<void> => onCloseButtonClick()}
              light>
              Sulje
            </SecondaryButton>
          </>
        )}
      </Navigation.Actions>
    </Navigation>
  );
}
