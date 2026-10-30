import { Compass } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { useTitulo } from '@/hooks/use-titulo'

export default function NotFoundPage() {
  useTitulo('Página no encontrada')
  return (
    <EmptyState
      icono={Compass}
      titulo="No encontramos esta página"
      descripcion="Puede que el enlace esté incompleto o que la página ya no exista."
      accion={
        <Button asChild>
          <Link to="/">Ir al inicio</Link>
        </Button>
      }
      className="mt-8"
    />
  )
}
