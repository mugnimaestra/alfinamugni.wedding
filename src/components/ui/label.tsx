import { component$, type QwikIntrinsicElements, Slot } from '@builder.io/qwik'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

type LabelProps = QwikIntrinsicElements['label'] & VariantProps<typeof labelVariants>

export const Label = component$<LabelProps>(({ class: className, ...props }) => (
  <label
    class={cn(labelVariants(), className)}
    {...props}
  >
    <Slot />
  </label>
))
