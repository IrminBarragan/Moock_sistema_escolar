import { useMutation } from '@tanstack/react-query'
import { AlertCircle, BookOpen, ChevronRight, Eye, EyeOff, GraduationCap, type LucideIcon, Settings, Users, Wallet } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'

import { Logo } from '@/components/shared/logo'
import { PrototypeBanner } from '@/components/layout/prototype-banner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { branding } from '@/config/branding'
import { ordenRoles, roles } from '@/config/roles'
import { useSesion } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { entrarComo, iniciarSesion, type Sesion } from '@/services/sesion'
import { ApiError, type Rol } from '@/types'
import { OlvideContrasena } from '../components/olvide-contrasena'

const accesos: Record<Rol, { icono: LucideIcon; persona: string }> = {
  alumno: { icono: GraduationCap, persona: 'Valeria Domínguez · 2ºA secundaria' },
  padre: { icono: Users, persona: 'Mariana Treviño · mamá de 2' },
  docente: { icono: BookOpen, persona: 'Mtro. Andrés Villaseñor · Matemáticas' },
  control: { icono: Wallet, persona: 'Lic. Patricia Navarro' },
  sistema: { icono: Settings, persona: 'Ing. Jorge Medina' },
}

export default function LoginPage() {
  useTitulo('Iniciar sesión')
  const sesion = useSesion()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [olvide, setOlvide] = useState(false)

  const desde = (ubicacion.state as { desde?: string } | null)?.desde

  function irAlInicio(s: Sesion) {
    navigate(desde?.startsWith(`/${s.rol}`) ? desde : roles[s.rol].inicio, { replace: true })
  }

  const login = useMutation({ mutationFn: () => iniciarSesion(correo, contrasena), onSuccess: irAlInicio })

  if (sesion && !login.isSuccess) return <Navigate to={roles[sesion.rol].inicio} replace />

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!login.isPending) login.mutate()
  }

  const error = login.error instanceof ApiError ? login.error : null

  return (
    <div className="flex min-h-dvh flex-col">
      <PrototypeBanner />
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 dark:bg-[color-mix(in_oklab,var(--brand-primary)_55%,black)] dark:text-white">
          <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.07]" aria-hidden="true">
            <defs>
              <pattern id="cuadricula" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0v32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cuadricula)" />
          </svg>
          <div className="relative flex items-center gap-3">
            <span className="rounded-xl bg-white/95 p-1.5">
              <Logo conNombre={false} />
            </span>
            <span className="text-lg font-semibold">{branding.nombre}</span>
          </div>
          <div className="relative max-w-md">
            <p className="text-sm font-medium tracking-wider uppercase opacity-80">Plataforma escolar</p>
            <h1 className="mt-3 text-4xl leading-[1.1] font-semibold">Clases, calificaciones y pagos en un solo lugar.</h1>
            <p className="mt-4 text-base leading-relaxed opacity-85">
              Alumnos, familias, docentes y control escolar trabajan sobre la misma información, con la identidad de tu escuela.
            </p>
          </div>
          <p className="relative text-sm opacity-75">{branding.lema} · Ciclo escolar 2026–2027</p>
        </aside>

        <main id="contenido" className="flex items-start justify-center px-4 py-10 sm:px-8 lg:items-center lg:py-12">
          <div className="w-full max-w-md">
            <Logo className="mb-8 lg:hidden" />
            <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
            <p className="mt-1.5 text-muted-foreground">Entra con el correo que te dio la escuela.</p>

            <form onSubmit={enviar} className="mt-8 grid gap-5" noValidate={false}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle aria-hidden="true" />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.detail}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  required
                  placeholder={`nombre.apellido@${branding.dominioCorreo}`}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  aria-invalid={error?.status === 401 || undefined}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => setOlvide(true)}
                    className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="contrasena"
                    type={verContrasena ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="pr-11"
                    aria-invalid={error?.status === 401 || undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1 right-1"
                    onClick={() => setVerContrasena((v) => !v)}
                    aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={verContrasena}
                  >
                    {verContrasena ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" size="lg" disabled={login.isPending}>
                {login.isPending ? 'Entrando…' : 'Iniciar sesión'}
              </Button>
            </form>

            <section aria-labelledby="titulo-accesos" className="mt-10">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <h3 id="titulo-accesos" className="text-sm font-medium text-muted-foreground">
                  Accesos rápidos de la demo
                </h3>
                <span className="h-px flex-1 bg-border" />
              </div>
              <ul className="mt-4 grid gap-2">
                {ordenRoles.map((rol) => {
                  const { icono: Icono, persona } = accesos[rol]
                  return (
                    <li key={rol}>
                      <button
                        type="button"
                        onClick={() => irAlInicio(entrarComo(rol))}
                        className="group flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icono className="size-[1.125rem]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">Entrar como {roles[rol].nombre.toLowerCase()}</span>
                          <span className="block truncate text-xs text-muted-foreground">{persona}</span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                También puedes entrar con el correo de cualquier usuario ficticio y cualquier contraseña.
              </p>
            </section>
          </div>
        </main>
      </div>
      <OlvideContrasena abierto={olvide} onCambio={setOlvide} />
    </div>
  )
}
