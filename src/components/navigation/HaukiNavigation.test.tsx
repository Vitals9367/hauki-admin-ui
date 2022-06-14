import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { getElementOrThrow } from '../../../test/test-utils';
import api from '../../common/utils/api/api';
import { AppContext } from '../../App-context';
import { AuthContext } from '../../auth/auth-context';
import HaukiNavigation from './HaukiNavigation';
import { Language } from '../../common/lib/types';

describe('<HaukiNavigation>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should logout and close window when user clicks close button', async () => {
    const closeAppWindow = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useHistory: (): { push: jest.Mock } => ({
        push: jest.fn(),
      }),
    }));

    jest
      .spyOn(api, 'invalidateAuth')
      .mockImplementation(() => Promise.resolve(true));

    const { container } = render(
      <Router>
        <AppContext.Provider value={{ hasOpenerWindow: true, closeAppWindow }}>
          <AuthContext.Provider
            value={{ authTokens: { name: 'tester' }, clearAuth: jest.fn() }}>
            <HaukiNavigation
              language={Language.FI}
              onLanguageChanged={jest.fn()}
            />
          </AuthContext.Provider>
        </AppContext.Provider>
      </Router>
    );
    userEvent.click(
      getElementOrThrow(container, '[data-test="close-app-button"]')
    );

    await waitFor(async () => {
      expect(closeAppWindow).toHaveBeenCalled();
    });
  });
});
