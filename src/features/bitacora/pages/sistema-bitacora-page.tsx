import { History } from 'lucide-react'
import { useState } from 'react'

import { CampoBusqueda } from '@/components/shared/campo-busqueda'
import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Paginacion } from '@/components/shared/paginacion'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ordenRoles, roles } from '@/config/roles'
import { useDebounce } from '@/hooks/use-debounce'
import { useTitulo } from '@/hooks/use-titulo'
import { fecha, hora } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ModuloBitacora, Rol } from '@/types'
import { useBitacora } from '../hooks'

const modulos: ModuloBitacora[] = ['Sesión', 'Aulas', 'Tareas', 'Calificaciones', 'Pagos', 'Alumnos', 'Grupos', 'Usuarios', 'Configuración']

export default function SistemaBitacoraPage() {
  useTitulo('Bitácora')
  const [texto, setTexto] = useState('')
  const q = useDebounce(texto, 300)
  const [modulo, setModulo] = useState<ModuloBitacora | 'todos'>('todos')
  const [rol, setRol] = useState<Rol | 'todos'>('todos')
  const [page, setPage] = useState(0)
  const consulta = useBitacora({ q, modulo, rol, page, size: 25 })

  return (
    <>
      <PageHeader
        titulo="Bitácora"
        descripcion="Registro de solo lectura de quién hizo qué y cuándo. Incluye las acciones que se hagan durante la demo."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_14rem]">
        <CampoBusqueda
          valor={texto}
          onCambio={(v) => {
            setTexto(v)
            setPage(0)
          }}
          etiqueta="Buscar en la bitácora"
          placeholder="Usuario, acción o detalle"
        />
        <Select
          value={modulo}
          onValueChange={(v) => {
            setModulo(v as ModuloBitacora | 'todos')
            setPage(0)
          }}
        >
          <SelectTrigger aria-label="Módulo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los módulos</SelectItem>
            {modulos.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={rol}
          onValueChange={(v) => {
            setRol(v as Rol | 'todos')
            setPage(0)
          }}
        >
          <SelectTrigger aria-label="Rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            {ordenRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {roles[r].nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Consulta
        consulta={consulta}
        esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}
        estaVacio={(p) => p.totalElements === 0}
        vacio={<EmptyState icono={History} titulo="Sin registros con esos filtros" descripcion="Prueba con otro módulo o búsqueda." />}
      >
        {(p) => (
          <div className={cn('grid gap-4 transition-opacity', consulta.isPlaceholderData && 'opacity-60')}>
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.content.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="align-top whitespace-nowrap tabular">
                        {fecha(e.fecha)}
                        <span className="block text-xs text-muted-foreground">{hora(e.fecha)}</span>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="block font-medium">{e.usuario}</span>
                        <span className="block text-xs text-muted-foreground">{roles[e.rol].nombre}</span>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant="outline">{e.modulo}</Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="block font-medium">{e.accion}</span>
                        <span className="block text-sm text-muted-foreground">{e.detalle}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Paginacion pagina={p.page} totalPaginas={p.totalPages} totalElementos={p.totalElements} tamano={p.size} onCambio={setPage} />
          </div>
        )}
      </Consulta>
    </>
  )
}
