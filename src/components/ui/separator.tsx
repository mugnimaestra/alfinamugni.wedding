import { component$, type QwikIntrinsicElements } from '@builder.io/qwik'
import { cn } from '~/lib/utils'

type SeparatorProps = QwikIntrinsicElements['div'] & {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

export const Separator = component$<SeparatorProps>(({ 
  class: className, 
  orientation = "horizontal", 
  decorative = true, 
  ...props 
}) => (
  <div
    role={decorative ? "none" : "separator"}
    aria-orientation={decorative ? undefined : orientation}
    class={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))
