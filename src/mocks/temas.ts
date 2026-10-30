/**
 * Temas por materia (seis por aula, dos por periodo de evaluación).
 * La clave es el nombre de la materia; algunas se especializan por grado.
 */
export const temasPorMateria: Record<string, string[]> = {
  'Español': ['Textos narrativos: el cuento', 'Reglas de acentuación', 'El texto expositivo', 'Ortografía: uso de b y v', 'La entrevista', 'Poesía y recursos literarios'],
  'Matemáticas|pri': ['Números naturales hasta millones', 'Fracciones equivalentes', 'Multiplicación y división', 'Perímetro y área', 'Decimales en la vida diaria', 'Tablas y gráficas'],
  'Matemáticas|sec-1': ['Números enteros y la recta numérica', 'Fracciones y decimales', 'Expresiones algebraicas', 'Ecuaciones de primer grado', 'Ángulos y triángulos', 'Probabilidad clásica'],
  'Matemáticas|sec-2': ['Operaciones con números con signo', 'Potencias y raíz cuadrada', 'Ecuaciones lineales', 'Proporcionalidad directa e inversa', 'Volumen de prismas y cilindros', 'Medidas de tendencia central'],
  'Matemáticas|sec-3': ['Productos notables', 'Factorización', 'Ecuaciones cuadráticas', 'Teorema de Pitágoras', 'Razones trigonométricas', 'Funciones lineales y cuadráticas'],
  'Ciencias Naturales': ['Los seres vivos y su entorno', 'El aparato digestivo', 'Cadenas alimentarias', 'Estados de la materia', 'La energía y sus formas', 'El sistema solar'],
  'Historia|pri': ['Los primeros pobladores de América', 'Mesoamérica', 'La Conquista', 'El virreinato de la Nueva España', 'La Independencia', 'La Reforma'],
  'Historia|sec': ['El mundo hacia 1800', 'Revoluciones liberales', 'México independiente', 'El Porfiriato', 'La Revolución mexicana', 'México en el siglo XX'],
  'Geografía': ['Representación del espacio geográfico', 'Coordenadas geográficas', 'Relieve y regiones naturales', 'Climas de México', 'Población y migración', 'Recursos naturales'],
  'Formación Cívica y Ética': ['Derechos humanos', 'Convivencia y resolución de conflictos', 'Igualdad y no discriminación', 'Participación democrática', 'Legalidad y justicia', 'Cuidado de la salud y del medio ambiente'],
  'Inglés': ['Greetings and introductions', 'Daily routines', 'Present simple vs. present continuous', 'Describing places', 'Past simple: regular verbs', 'Future plans'],
  'Educación Física': ['Capacidades físicas básicas', 'Juegos cooperativos', 'Coordinación y equilibrio', 'Iniciación deportiva: voleibol', 'Hábitos saludables', 'Expresión corporal'],
  'Biología': ['La biodiversidad de México', 'La célula', 'Nutrición y salud', 'Respiración', 'Reproducción', 'Herencia genética'],
  'Física': ['El movimiento: velocidad y rapidez', 'Aceleración y caída libre', 'Las leyes de Newton', 'Trabajo y energía', 'Calor y temperatura', 'Electricidad y magnetismo'],
  'Química': ['Propiedades de la materia', 'Mezclas y métodos de separación', 'El modelo atómico', 'La tabla periódica', 'Enlaces químicos', 'Reacciones químicas'],
  'Artes': ['Elementos del lenguaje visual', 'El color y sus significados', 'Perspectiva y volumen', 'Arte mexicano contemporáneo', 'Fotografía y composición', 'Proyecto colectivo de mural'],
  'Matemáticas I': ['Lenguaje algebraico', 'Operaciones con polinomios', 'Productos notables y factorización', 'Ecuaciones lineales', 'Sistemas de ecuaciones', 'Ecuaciones cuadráticas'],
  'Matemáticas III': ['Sistemas de coordenadas', 'La línea recta', 'La circunferencia', 'La parábola', 'La elipse', 'La hipérbola'],
  'Química I': ['La química y su relación con el entorno', 'La materia y sus cambios', 'Modelos atómicos', 'Tabla periódica y propiedades', 'Enlaces químicos', 'Nomenclatura inorgánica'],
  'Taller de Lectura y Redacción I': ['La comunicación', 'Funciones de la lengua', 'Tipos de texto', 'El párrafo', 'Textos expositivos', 'El resumen y la síntesis'],
  'Inglés I': ['Personal information', 'Verb to be', 'Daily activities', 'Describing people', 'Can and can’t', 'Simple past'],
  'Inglés III': ['Present perfect', 'Comparatives and superlatives', 'Modal verbs', 'Conditionals: first and second', 'Passive voice', 'Reported speech'],
  'Informática I': ['Sistemas operativos', 'Procesador de textos', 'Hoja de cálculo: fórmulas', 'Hoja de cálculo: gráficas', 'Presentaciones efectivas', 'Ciudadanía digital'],
  'Metodología de la Investigación': ['El conocimiento científico', 'Planteamiento del problema', 'Marco teórico', 'Hipótesis y variables', 'Técnicas de recolección de datos', 'El reporte de investigación'],
  'Ética y Valores I': ['La ética como disciplina', 'Libertad y responsabilidad', 'Valores y dilemas morales', 'Ética y tecnología', 'Bioética', 'Ciudadanía y bien común'],
  'Física I': ['Magnitudes y unidades de medida', 'Vectores', 'Movimiento rectilíneo uniforme', 'Movimiento uniformemente acelerado', 'Leyes de Newton', 'Trabajo, energía y potencia'],
  'Biología I': ['Características de los seres vivos', 'Biomoléculas', 'Estructura celular', 'Metabolismo celular', 'División celular', 'Origen de la vida'],
  'Historia de México I': ['Poblamiento de América', 'Mesoamérica', 'Conquista y colonización', 'La Nueva España', 'Movimiento de Independencia', 'Primeros años del México independiente'],
  'Literatura I': ['El texto literario', 'Géneros literarios', 'La narrativa: cuento y novela', 'El cuento latinoamericano', 'Lírica: el poema', 'Comentario literario'],
}

export function temasDe(materia: string, gradoId: string): string[] {
  const nivel = gradoId.split('-')[0]
  return (
    temasPorMateria[`${materia}|${gradoId}`] ??
    temasPorMateria[`${materia}|${nivel}`] ??
    temasPorMateria[materia] ??
    temasPorMateria['Español']
  )
}
