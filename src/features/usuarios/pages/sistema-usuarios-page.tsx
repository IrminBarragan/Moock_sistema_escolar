import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { CampoBusqueda } from '@/components/shared/campo-busqueda'
import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Paginacion } from '@/components/shared/paginacion'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ordenRoles, roles } from '@/config/roles'
import { useDebounce } from '@/hooks/use-debounce'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { fechaHora, numero } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Rol, Usuario } from '@/types'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks'

const permisos: Record<Rol, string> = {
  alumno: 'Sus materias, tareas y calificaciones',
  padre: 'Consulta de sus hijos y estado de cuenta',
  docente: 'Sus aulas, tareas y calificaciones',
  control: 'Alumnos, grupos, pagos y reportes',
  sistema: 'Configuración, usuarios y bitácora',
}

export default function SistemaUsuariosPage() {
  useTitulo('Usuarios y permisos')
  const sesion = useSesionActiva()
  const [params, setParams] = useSearchParams()
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const q = useDebounce(texto, 300)
  const rol = (params.get('rol') ?? 'todos') as Rol | 'todos'
  const estado = (params.get('estado') ?? 'todos') as 'activos' | 'inactivos' | 'todos'
  const page = Number(params.get('pagina') ?? 0)
  const consulta = useUsuarios({ q, rol, estado, page, size: 20 })
  const cambiarEstado = useCambiarEstadoUsuario()

  function cambiar(c: Record<string, string | null>) {
    const s = new URLSearchParams(params)
    for (const [k, v] of Object.entries(c)) {
      if (v === null || v === 'todos') s.delete(k)
      else s.set(k, v)
    }
    if (!('pagina' in c)) s.delete('pagina')
    setParams(s, { replace: true })
  }

  function alternar(u: Usuario, activo: boolean) {
    cambiarEstado.mutate(
      { id: u.id, activo },
      {
        onSuccess: () =>
          toast.success(activo ? 'Usuario activado' : 'Usuario desactivado', {
            description: activo ? `${u.nombre} ya puede entrar a la plataforma.` : `${u.nombre} ya no podrá iniciar sesión.`,
            action: { label: 'Deshacer', onClick: () => cambiarEstado.mutate({ id: u.id, activo: !activo }) },
          }),
      },
    )
  }

  return (
    <>
      <PageHeader titulo="Usuarios y permisos" descripcion="Cada rol ve solo lo suyo. Desactiva una cuenta para impedir el acceso sin borrar su historial." />

      <ul className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {ordenRoles.map((r) => (
          <li key={r}>
            <button
              type="button"
              aria-pressed={rol === r}
              onClick={() => cambiar({ rol: rol === r ? null : r })}
              className={cn(
                'h-full w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/35 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                rol === r && 'border-primary bg-primary/5',
              )}
            >
              <span className="block text-sm font-medium">{roles[r].nombre}</span>
              <span className="mt-1 block text-2xl font-semibold tabular">{consulta.data ? numero(consulta.data.porRol[r]) : '—'}</span>
              <span className="mt-1 block text-xs leading-snug text-muted-foreground">{permisos[r]}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_11rem]">
        <CampoBusqueda
          valor={texto}
          onCambio={(v) => {
            setTexto(v)
            cambiar({ q: v || null })
          }}
          etiqueta="Buscar usuarios"
          placeholder="Nombre o correo"
        />
        <Select value={rol} onValueChange={(v) => cambiar({ rol: v })}>
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
        <Select value={estado} onValueChange={(v) => cambiar({ estado: v })}>
          <SelectTrigger aria-label="Estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Activos e inactivos</SelectItem>
            <SelectItem value="activos">Solo activos</SelectItem>
            <SelectItem value="inactivos">Solo inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Consulta
        consulta={consulta}
        esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}
        estaVacio={(p) => p.totalElements === 0}
        vacio={<EmptyState icono={SearchX} titulo="No hay usuarios con esos filtros" descripcion="Cambia el rol, el estado o la búsqueda." />}
      >
        {(p) => (
          <div className={cn('grid gap-4 transition-opacity', consulta.isPlaceholderData && 'opacity-60')}>
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="text-right">Acceso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.content.map((u) => {
                    const yo = u.id === sesion.usuarioId
                    return (
                      <TableRow key={u.id} className={cn(!u.activo && 'text-muted-foreground')}>
                        <TableCell>
                          <span className="block font-medium text-foreground">
                            {u.nombre}
                            {yo && <span className="ml-2 text-xs font-normal text-muted-foreground">(tú)</span>}
                          </span>
                          <span className="block text-xs text-muted-foreground">{u.correo}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.puesto ?? roles[u.rol].nombre}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular">{u.ultimoAcceso ? fechaHora(u.ultimoAcceso) : 'Nunca'}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-2.5">
                            <span className={cn('text-sm', u.activo ? 'text-success' : 'text-muted-foreground')} id={`estado-${u.id}`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <Switch
                              checked={u.activo}
                              disabled={yo || cambiarEstado.isPending}
                              onCheckedChange={(v) => alternar(u, v)}
                              aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                              aria-describedby={`estado-${u.id}`}
                            />
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <Paginacion
              pagina={p.page}
              totalPaginas={p.totalPages}
              totalElementos={p.totalElements}
              tamano={p.size}
              onCambio={(n) => cambiar({ pagina: String(n) })}
              sustantivo={['usuario', 'usuarios']}
            />
          </div>
        )}
      </Consulta>
    </>
  )
}
