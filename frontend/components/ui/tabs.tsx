"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex min-h-12 w-fit items-center justify-center rounded-nav border border-stroke bg-surface-inner p-1 text-copy-muted group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none data-[variant=line]:border-x-0 data-[variant=line]:border-t-0",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "product-focus relative inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-transparent px-4 py-2 text-sm font-medium text-copy-muted transition duration-300 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-active:border-brand-cyan/20 data-active:bg-brand-cyan/10 data-active:text-brand-cyan group-data-[variant=line]/tabs-list:data-active:border-x-0 group-data-[variant=line]/tabs-list:data-active:border-t-0 group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "after:absolute after:bg-brand-cyan after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-3 group-data-horizontal/tabs:after:-bottom-1.5 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-2 group-data-vertical/tabs:after:-right-1.5 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
