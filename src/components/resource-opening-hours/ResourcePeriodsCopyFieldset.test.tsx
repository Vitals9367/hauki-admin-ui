import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '../../App-context';
import api from '../../common/utils/api/api';
import toast from '../notification/Toast';
import ResourcePeriodsCopyFieldset, {
  TargetResourcesProps,
} from './ResourcePeriodsCopyFieldset';

const testCopyResourceData: TargetResourcesProps = {
  mainResourceId: 1111,
  mainResourceName: 'testTargetResource',
  targetResources: ['tprek: 1122'],
};

describe(`<ResourcePeriodsCopyFieldset/>`, () => {
  let onChange: jest.Mock;

  beforeEach(() => {
    onChange = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should copy targets when user clicks the copy button', async () => {
    const utcTimeString = '2022-01-24T18:00:00.000Z';
    jest.spyOn(Date.prototype, 'toJSON').mockReturnValue(utcTimeString);

    const apiCopySpy = jest
      .spyOn(api, 'copyDatePeriods')
      .mockImplementation(() => Promise.resolve(true));

    const toastSuccessSpy = jest.spyOn(toast, 'success');

    render(
      <AppContext.Provider
        value={{ hasOpenerWindow: false, closeAppWindow: jest.fn() }}>
        <ResourcePeriodsCopyFieldset
          {...testCopyResourceData}
          onChange={onChange}
        />
      </AppContext.Provider>
    );

    userEvent.click(
      screen.getByRole('button', {
        name: 'Päivitä aukiolotiedot 1 muuhun toimipisteeseen',
      })
    );

    await waitFor(async () => {
      expect(apiCopySpy).toHaveBeenCalledWith(
        testCopyResourceData.mainResourceId,
        testCopyResourceData.targetResources
      );
      expect(toastSuccessSpy).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith({
        ...testCopyResourceData,
        modified: utcTimeString,
      });
    });
  });

  it('should show window closing info when the app is opened from another window', async () => {
    const closeAppWindow = jest.fn();

    render(
      <AppContext.Provider value={{ hasOpenerWindow: true, closeAppWindow }}>
        <ResourcePeriodsCopyFieldset
          {...testCopyResourceData}
          onChange={onChange}
        />
      </AppContext.Provider>
    );

    userEvent.click(
      screen.getByRole('button', {
        name:
          'Päivitä aukiolotiedot 1 muuhun toimipisteeseen. Ikkuna sulkeutuu.',
      })
    );

    await waitFor(async () => {
      expect(closeAppWindow).toHaveBeenCalled();
    });
  });

  it('should show error notification when api copy fails', async () => {
    const error: Error = new Error('Failed to load a resource');
    const apiCopySpy = jest
      .spyOn(api, 'copyDatePeriods')
      .mockImplementation(() => Promise.reject(error));
    const toastErrorSpy = jest.spyOn(toast, 'error');
    jest.spyOn(global.console, 'error').mockImplementationOnce((e) => e);

    render(
      <AppContext.Provider
        value={{ hasOpenerWindow: false, closeAppWindow: jest.fn() }}>
        <ResourcePeriodsCopyFieldset
          {...testCopyResourceData}
          onChange={onChange}
        />
      </AppContext.Provider>
    );

    userEvent.click(
      screen.getByRole('button', {
        name: 'Päivitä aukiolotiedot 1 muuhun toimipisteeseen',
      })
    );

    await waitFor(async () => {
      expect(apiCopySpy).toHaveBeenCalled();
      expect(toastErrorSpy).toHaveBeenCalled();
    });
  });
});
