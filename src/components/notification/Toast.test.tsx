import { act } from 'react-dom/test-utils';
import toast from './Toast';

describe(`toast`, () => {
  jest.useFakeTimers();

  it('should render success toast in the dom', async () => {
    const props = {
      dataTestId: 'test-success-notification',
      label: 'test-success-notification-label',
      text: 'test-success-notification-text',
    };

    act(() => {
      toast.success(props);
    });

    const successToast = document.body.querySelector(
      `[data-testId="${props.dataTestId}"]`
    );

    expect(successToast).toHaveTextContent(props.label);
    expect(successToast).toHaveTextContent(props.text);
  });

  // TODO: Fix me
  // it('should remove notification container from the dom after close', async () => {
  //   const props = {
  //     dataTestId: 'test-remove-notification',
  //     label: 'test-remove-notification-label',
  //     text: 'test-remove-notification-text',
  //   };

  //   act(() => {
  //     toast.success(props);
  //     expect(
  //       document.body.querySelectorAll(`[data-testId="${props.dataTestId}"]`)
  //         .length
  //     ).toBe(1);
  //   });

  //   act(() => {
  //     jest.advanceTimersByTime(20000);
  //     expect(
  //       document.body.querySelectorAll(`[data-testId="${props.dataTestId}"]`)
  //         .length
  //     ).toBe(0);
  //   });
  // });
});
