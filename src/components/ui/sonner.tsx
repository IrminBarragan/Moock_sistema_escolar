import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { usePreferencias } from '@/hooks/use-preferencias'

function Toaster(props: ToasterProps) {
  const { temaEfectivo } = usePreferencias()
  return (
    <Sonner
      theme={temaEfectivo}
      className="toaster group"
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast !rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-lg',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground',
          closeButton: '!bg-popover !border-border !text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
