import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { crearCiclo, guardarCobro, guardarMateria, guardarPeriodo, obtenerConfiguracion } from '@/services/configuracion.service'
import type { ConfiguracionCobro } from '@/types'

export function useConfiguracion() {
  return useQuery({ queryKey: ['configuracion'], queryFn: obtenerConfiguracion })
}

function useAlGuardar() {
  const qc = useQueryClient()
  // La configuración afecta periodos, boletas y planillas en otras pantallas.
  return () => qc.invalidateQueries()
}

export function useCrearCiclo() {
  return useMutation({ mutationFn: crearCiclo, onSuccess: useAlGuardar() })
}

export function useGuardarMateria() {
  return useMutation({ mutationFn: guardarMateria, onSuccess: useAlGuardar() })
}

export function useGuardarPeriodo() {
  return useMutation({ mutationFn: ({ id, ...d }: { id: string; inicio: string; fin: string }) => guardarPeriodo(id, d), onSuccess: useAlGuardar() })
}

export function useGuardarCobro() {
  return useMutation({ mutationFn: (c: ConfiguracionCobro) => guardarCobro(c), onSuccess: useAlGuardar() })
}
