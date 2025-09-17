import { 
  component$, 
  useSignal, 
  useContext, 
  createContextId, 
  useContextProvider,
  Slot, 
  type QwikIntrinsicElements,
  $,
  type PropFunction
} from '@builder.io/qwik'
import { cn } from '~/lib/utils'

// Context for tab state management
interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContextId<TabsContextType>('tabs-context')

type TabsProps = QwikIntrinsicElements['div'] & {
  defaultValue?: string
  value?: string
  onValueChange$?: PropFunction<(value: string) => void>
}

export const Tabs = component$<TabsProps>(({ 
  defaultValue, 
  value, 
  class: className, 
  ...props 
}) => {
  const activeTab = useSignal(value || defaultValue || '')
  
  const setActiveTab = $((tab: string) => {
    activeTab.value = tab
  })

  const contextValue: TabsContextType = {
    activeTab: activeTab.value,
    setActiveTab
  }

  useContextProvider(TabsContext, contextValue)

  // Filter out custom props before spreading
  const { ...divProps } = props as any

  return (
    <div class={className} {...divProps}>
      <Slot />
    </div>
  )
})

type TabsListProps = QwikIntrinsicElements['div']

export const TabsList = component$<TabsListProps>(({ class: className, ...props }) => (
  <div
    class={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
))

type TabsTriggerProps = QwikIntrinsicElements['button'] & {
  value: string
}

export const TabsTrigger = component$<TabsTriggerProps>(({ 
  value, 
  class: className, 
  ...props 
}) => {
  const tabsContext = useContext(TabsContext)
  const isActive = tabsContext.activeTab === value

  return (
    <button
      class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      onClick$={() => tabsContext.setActiveTab(value)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    >
      <Slot />
    </button>
  )
})

type TabsContentProps = QwikIntrinsicElements['div'] & {
  value: string
}

export const TabsContent = component$<TabsContentProps>(({ 
  value, 
  class: className, 
  ...props 
}) => {
  const tabsContext = useContext(TabsContext)
  const isActive = tabsContext.activeTab === value

  if (!isActive) {
    return null
  }

  return (
    <div
      class={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  )
})
