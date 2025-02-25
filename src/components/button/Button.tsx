import {
  Button as HDSButton,
  ButtonSize,
  ButtonSize as HDSButtonSize,
} from 'hds-react';
import React, { ReactNode } from 'react';
import './Button.scss';

type ButtonTypeVariant = 'button' | 'submit' | 'reset' | undefined;

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  dataTest?: string;
  className?: string;
  type?: ButtonTypeVariant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  size?: ButtonSize;
  'aria-expanded'?: boolean;
}

export function SecondaryButton({
  children,
  dataTest,
  disabled,
  onClick,
  className = '',
  type = 'button',
  iconLeft,
  iconRight,
  isLoading,
  loadingText,
  light = false,
  size = 'default',
  'aria-expanded': ariaExpanded,
}: ButtonProps & { light?: boolean; size?: HDSButtonSize }): JSX.Element {
  return (
    <HDSButton
      aria-expanded={ariaExpanded}
      className={`button-common ${
        light ? 'secondary-button-light' : 'secondary-button'
      } ${className}`}
      theme={light ? 'default' : 'coat'}
      size={size}
      data-test={dataTest}
      disabled={disabled}
      variant="secondary"
      onClick={onClick}
      type={type}
      iconLeft={iconLeft}
      iconRight={iconRight}
      isLoading={isLoading}
      loadingText={loadingText}>
      {children}
    </HDSButton>
  );
}

export function PrimaryButton({
  children,
  dataTest,
  onClick,
  className = '',
  type = 'button',
  iconLeft,
  iconRight,
  disabled,
  isLoading,
  loadingText,
  size = 'default',
  'aria-expanded': ariaExpanded,
}: ButtonProps): JSX.Element {
  return (
    <HDSButton
      aria-expanded={ariaExpanded}
      data-test={dataTest}
      className={`button-common primary-button ${
        disabled && 'primary-button--is-disabled'
      } ${isLoading && 'primary-button--is-loading'} ${className}`}
      variant="primary"
      onClick={onClick}
      type={type}
      iconLeft={iconLeft}
      iconRight={iconRight}
      disabled={disabled}
      isLoading={isLoading}
      loadingText={loadingText}
      size={size}>
      {children}
    </HDSButton>
  );
}

export const SupplementaryButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      children,
      dataTest,
      disabled,
      onClick,
      className = '',
      type = 'button',
      iconLeft,
      iconRight,
      isLoading,
      loadingText,
      size = 'default',
      'aria-expanded': ariaExpanded,
    },
    ref
  ): JSX.Element => {
    return (
      <HDSButton
        aria-expanded={ariaExpanded}
        ref={ref}
        type={type}
        data-test={dataTest}
        className={`button-common supplementary-button ${className}`}
        variant="supplementary"
        onClick={onClick}
        iconLeft={iconLeft}
        iconRight={iconRight}
        isLoading={isLoading}
        loadingText={loadingText}
        disabled={disabled}
        size={size}>
        {children}
      </HDSButton>
    );
  }
);
