/**
 * typescript-eslint todavía no soporta la API de TypeScript 7. Siguiendo la guía
 * oficial de TS 7 ("running side by side with TypeScript 6.0"), las
 * herramientas de lint reciben la API de TypeScript 6 (@typescript/typescript6),
 * mientras que el proyecto compila y revisa tipos con TypeScript 7 (tsc).
 * Cuando typescript-eslint soporte TS 7, basta con borrar este archivo.
 */
const TS6 = 'npm:@typescript/typescript6@6.0.2'
const usanApiDeTypescript = (nombre) =>
  nombre === 'typescript-eslint' || nombre.startsWith('@typescript-eslint/') || nombre === 'ts-api-utils'

function readPackage(pkg) {
  if (usanApiDeTypescript(pkg.name)) {
    if (pkg.peerDependencies?.typescript) delete pkg.peerDependencies.typescript
    if (pkg.peerDependenciesMeta?.typescript) delete pkg.peerDependenciesMeta.typescript
    pkg.dependencies = { ...pkg.dependencies, typescript: TS6 }
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
