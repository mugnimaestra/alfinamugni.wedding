import { component$, type QwikIntrinsicElements, Slot } from '@builder.io/qwik'
import { cn } from '~/lib/utils'

type CardProps = QwikIntrinsicElements['div']

export const Card = component$<CardProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
))

type CardHeaderProps = QwikIntrinsicElements['div']

export const CardHeader = component$<CardHeaderProps>(({ class: className, ...props }) => (
  <div
    class={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    <Slot />
  </div>
))

type CardTitleProps = QwikIntrinsicElements['div']

export const CardTitle = component$<CardTitleProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
))

type CardDescriptionProps = QwikIntrinsicElements['div']

export const CardDescription = component$<CardDescriptionProps>(({ class: className, ...props }) => (
  <div
    class={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    <Slot />
  </div>
))

type CardContentProps = QwikIntrinsicElements['div']

export const CardContent = component$<CardContentProps>(({ class: className, ...props }) => (
  <div class={cn("p-6 pt-0", className)} {...props}>
    <Slot />
  </div>
))

type CardFooterProps = QwikIntrinsicElements['div']

export const CardFooter = component$<CardFooterProps>(({ class: className, ...props }) => (
  <div
    class={cn("flex items-center p-6 pt-0", className)}
    {...props}
  >
    <Slot />
  </div>
))
