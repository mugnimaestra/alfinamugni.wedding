import {
  component$,
  useSignal,
  useOnDocument,
  Slot,
  type QwikIntrinsicElements,
  type JSXOutput,
  $,
  type PropFunction
} from '@builder.io/qwik'
import { X } from 'lucide-react'
import { cn } from '~/lib/utils'

export interface DialogProps {
  open?: boolean
  onOpenChange$?: PropFunction<(open: boolean) => void>
  children: JSXOutput
}

export const Dialog = component$<DialogProps>(({ open, children }) => {
  const isOpen = useSignal(open || false)

  return (
    <div data-dialog-open={isOpen.value}>
      {children}
    </div>
  )
})

type DialogTriggerProps = QwikIntrinsicElements['button']

export const DialogTrigger = component$<DialogTriggerProps>(({ class: className, ...props }) => {
  return (
    <button
      class={className}
      onClick$={() => {
        // Simple approach: toggle dialog visibility via event
        document.dispatchEvent(new CustomEvent('dialog-open'))
      }}
      {...props}
    >
      <Slot />
    </button>
  )
})

type DialogOverlayProps = QwikIntrinsicElements['div']

export const DialogOverlay = component$<DialogOverlayProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
))

type DialogContentProps = QwikIntrinsicElements['div']

export const DialogContent = component$<DialogContentProps>(({ class: className, ...props }) => {
  const dialogRef = useSignal<HTMLDivElement>()

  useOnDocument('keydown', $((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.dispatchEvent(new CustomEvent('dialog-close'))
    }
  }))

  return (
    <div class="fixed inset-0 z-50">
      <DialogOverlay 
        onClick$={() => {
          document.dispatchEvent(new CustomEvent('dialog-close'))
        }}
      />
      <div
        ref={dialogRef}
        class={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        {...props}
      >
        <Slot />
        <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </div>
    </div>
  )
})

type DialogCloseProps = QwikIntrinsicElements['button']

export const DialogClose = component$<DialogCloseProps>(({ class: className, ...props }) => (
  <button
    class={className}
    onClick$={() => {
      document.dispatchEvent(new CustomEvent('dialog-close'))
    }}
    {...props}
  >
    <Slot />
  </button>
))

type DialogHeaderProps = QwikIntrinsicElements['div']

export const DialogHeader = component$<DialogHeaderProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
))

type DialogFooterProps = QwikIntrinsicElements['div']

export const DialogFooter = component$<DialogFooterProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
))

type DialogTitleProps = QwikIntrinsicElements['h2']

export const DialogTitle = component$<DialogTitleProps>(({ class: className, ...props }) => (
  <h2
    class={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    <Slot />
  </h2>
))

type DialogDescriptionProps = QwikIntrinsicElements['p']

export const DialogDescription = component$<DialogDescriptionProps>(({ class: className, ...props }) => (
  <p
    class={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    <Slot />
  </p>
))
