import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../utils/cn'

/* ---------------------------------------------------------------------------
 * Variants
 * --------------------------------------------------------------------------- */

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-xxs shrink-0 whitespace-nowrap',
    'rounded-xs font-body font-heading-medium cursor-pointer',
    'border-(length:--border-width-default) border-solid',
    'transition-colors duration-150',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-text-selected',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed',
  ],
  {
    defaultVariants: {
      shape: 'default',
      size: 'base',
      variant: 'brand',
    },
    variants: {
      shape: {
        default: 'px-md',
        icon: 'px-button-height',
      },
      size: {
        base: 'py-button-height text-body-small leading-body-small [&_svg]:size-[9px]',
        large:
          'py-button-height text-body-medium leading-body-medium [&_svg]:size-[12px]',
      },
      variant: {
        brand: [
          'text-text-brand-button border-transparent',
          'bg-background-brand-primary',
          'hover:bg-background-brand-primary-hover',
          'active:bg-background-brand-primary-pressed',
          '[&_svg]:text-icon-brand-button',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        danger: [
          'text-text-danger border-transparent',
          'bg-background-system-danger',
          'hover:bg-background-system-danger-hover',
          'active:bg-background-system-danger-pressed',
          '[&_svg]:text-icon-danger',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        'danger-bold': [
          'text-text-primary-inverse border-transparent',
          'bg-background-system-danger-bold',
          'hover:bg-background-system-danger-bold-hover',
          'active:bg-background-system-danger-bold-pressed',
          '[&_svg]:text-icon-inverse',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        primary: [
          'text-text-primary border-border-primary shadow-elevation-element',
          'bg-background-neutral-primary',
          'hover:bg-background-neutral-primary-hover',
          'active:bg-background-neutral-primary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:shadow-none data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        secondary: [
          'text-text-primary border-border-primary',
          'bg-background-neutral-secondary',
          'hover:bg-background-neutral-secondary-hover',
          'active:bg-background-neutral-secondary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        tertiary: [
          'text-text-primary border-transparent',
          'bg-background-neutral-secondary',
          'hover:bg-background-neutral-secondary-hover',
          'active:bg-background-neutral-secondary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:text-text-disabled data-[disabled]:bg-transparent data-[disabled]:[&_svg]:text-icon-disabled',
        ],
      },
    },
  },
)

/* ---------------------------------------------------------------------------
 * Button
 * --------------------------------------------------------------------------- */

type ButtonProps = Omit<
  React.ComponentProps<typeof ButtonPrimitive>,
  'className'
> & {
  className?: string
  label?: string
  shape?: 'default' | 'icon'
  size?: 'base' | 'large'
  variant?: 'brand' | 'danger' | 'danger-bold' | 'primary' | 'secondary' | 'tertiary'
}

/**
 * Curri-styled button built on the Base UI Button primitive.
 * Source: @curri/components/src/components/Button/Button.tsx
 */
function Button({
  children,
  className,
  label,
  shape = 'default',
  size = 'base',
  variant = 'brand',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ shape, size, variant }), className)}
      {...props}
    >
      {children || label}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
