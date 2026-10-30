import { useSearchParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTitulo } from '@/hooks/use-titulo'
import { TabCiclos } from '../components/tab-ciclos'
import { TabCobro } from '../components/tab-cobro'
import { TabMaterias } from '../components/tab-materias'
import { TabNiveles } from '../components/tab-niveles'
import { TabPeriodos } from '../components/tab-periodos'
import { useConfiguracion } from '../hooks'

const pestanas = ['ciclos', 'niveles', 'materias', 'periodos', 'cobro'] as const

export default function SistemaConfiguracionPage() {
  useTitulo('Configuración')
  const consulta = useConfiguracion()
  const [params, setParams] = useSearchParams()
  const pestana = pestanas.find((p) => p === params.get('pestana')) ?? 'ciclos'
  return (
    <>
      <PageHeader titulo="Configuración" descripcion="Parámetros generales de la escuela. Los cambios quedan registrados en la bitácora." />
      <Tabs value={pestana} onValueChange={(v) => setParams({ pestana: v }, { replace: true })}>
        <TabsList aria-label="Secciones de configuración">
          <TabsTrigger value="ciclos">Ciclos escolares</TabsTrigger>
          <TabsTrigger value="niveles">Niveles y grados</TabsTrigger>
          <TabsTrigger value="materias">Materias</TabsTrigger>
          <TabsTrigger value="periodos">Periodos de evaluación</TabsTrigger>
          <TabsTrigger value="cobro">Periodicidad de cobro</TabsTrigger>
        </TabsList>
        <Consulta consulta={consulta} esqueleto={<Skeleton className="h-96 rounded-xl" />}>
          {(config) => (
            <>
              <TabsContent value="ciclos">
                <TabCiclos ciclos={config.ciclos} />
              </TabsContent>
              <TabsContent value="niveles">
                <TabNiveles niveles={config.niveles} />
              </TabsContent>
              <TabsContent value="materias">
                <TabMaterias config={config} />
              </TabsContent>
              <TabsContent value="periodos">
                <TabPeriodos config={config} />
              </TabsContent>
              <TabsContent value="cobro">
                <TabCobro key={JSON.stringify(config.cobro)} config={config} />
              </TabsContent>
            </>
          )}
        </Consulta>
      </Tabs>
    </>
  )
}
