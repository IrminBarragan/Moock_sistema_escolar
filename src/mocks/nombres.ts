/** Listas de nombres comunes en México para combinar en personas ficticias. */

export const nombresMujer = [
  'Ana Sofía', 'Valentina', 'Regina', 'Ximena', 'Camila', 'Renata', 'María José', 'Daniela',
  'Fernanda', 'Isabella', 'Natalia', 'Paula', 'Andrea', 'Victoria', 'Romina', 'Mariana',
  'Lucía', 'Ivanna', 'Alexa', 'Montserrat', 'Danna', 'Jimena', 'Aitana', 'Elena',
  'Sara', 'Abril', 'Itzel', 'Frida', 'Brenda', 'Karla', 'Paola', 'Julieta',
]

export const nombresHombre = [
  'Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Emiliano', 'Diego', 'Daniel', 'Miguel Ángel',
  'Alejandro', 'Iker', 'Rodrigo', 'Gael', 'José Pablo', 'Adrián', 'Joaquín', 'Bruno',
  'Fernando', 'Ángel', 'Tomás', 'Ricardo', 'Maximiliano', 'Andrés', 'Luis Fernando', 'Carlos',
  'Íñigo', 'Patricio', 'Damián', 'Hugo', 'Arturo', 'Emilio', 'Gerardo', 'Óscar',
]

export const nombresAdultoMujer = [
  'Claudia', 'Verónica', 'Gabriela', 'Patricia', 'Alejandra', 'Adriana', 'Leticia', 'Rocío',
  'Mónica', 'Silvia', 'Laura', 'Norma', 'Liliana', 'Lorena', 'Erika', 'Diana', 'Beatriz', 'Araceli',
]

export const nombresAdultoHombre = [
  'Jorge', 'Juan Carlos', 'Eduardo', 'Roberto', 'Francisco', 'Javier', 'Raúl', 'Sergio',
  'Héctor', 'Manuel', 'Alberto', 'Rafael', 'Guillermo', 'Enrique', 'Gustavo', 'Armando', 'Marco Antonio', 'Víctor',
]

export const apellidos = [
  'Hernández', 'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez',
  'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez', 'Reyes', 'Jiménez',
  'Torres', 'Díaz', 'Gutiérrez', 'Ruiz', 'Mendoza', 'Aguilar', 'Ortiz', 'Moreno',
  'Castillo', 'Romero', 'Álvarez', 'Méndez', 'Chávez', 'Rivera', 'Juárez', 'Ramos',
  'Domínguez', 'Herrera', 'Medina', 'Castro', 'Vargas', 'Guzmán', 'Velázquez', 'Salazar',
  'Rojas', 'Contreras', 'Luna', 'Ríos', 'Cervantes', 'Escobar', 'Ibarra', 'Valdez',
  'Ávila', 'Campos', 'Navarro', 'Espinoza', 'Cortés', 'Fuentes', 'Solís', 'Lara',
  'Esquivel', 'Arellano', 'Treviño', 'Zamora', 'Cisneros', 'Becerra', 'Olvera', 'Villarreal',
]

export const ocupacionesMujer = [
  'Contadora pública', 'Médica general', 'Comerciante', 'Abogada', 'Docente', 'Arquitecta',
  'Empresaria', 'Enfermera', 'Administradora', 'Odontóloga', 'Ingeniera en sistemas', 'Psicóloga',
]

export const ocupacionesHombre = [
  'Contador público', 'Ingeniero civil', 'Médico general', 'Comerciante', 'Abogado', 'Docente',
  'Arquitecto', 'Empresario', 'Diseñador gráfico', 'Odontólogo', 'Agente de ventas', 'Chef',
]

export const colonias = [
  'Col. Jardines del Valle', 'Col. Lomas de San Ángel', 'Fracc. Las Arboledas', 'Col. Centro',
  'Col. Residencial del Parque', 'Fracc. Villas del Sol', 'Col. Bosques de la Loma', 'Col. Santa Rita',
  'Fracc. Los Olivos', 'Col. Del Carmen', 'Col. Puerta Real', 'Fracc. Cumbres del Lago',
]

export const calles = [
  'Av. de los Maestros', 'Calle Fresno', 'Calle Jacarandas', 'Av. Hidalgo', 'Calle Nogal',
  'Privada Cedros', 'Calle Álamo', 'Av. Juárez', 'Calle Magnolia', 'Calle Sauce', 'Calle Encino',
]

/** Quita acentos y espacios para formar correos ficticios. */
export function normalizarParaCorreo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}
