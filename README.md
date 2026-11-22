# 💸 Gestor de Gastos

Aplicación web desarrollada con Node.js para registrar, consultar y analizar gastos
personales. Permite administrar presupuestos mensuales, controlar el gasto disponible
y comparar el comportamiento de diferentes meses.

## Características Principales

- **Presupuesto mensual compartido:** Ambas quincenas comparten el límite del mes.
- **Registro estructurado:** Los gastos incluyen fecha, descripción de hasta 40 caracteres, categoría y monto.
- **Validación de datos:** Todos los campos del gasto son obligatorios y las categorías están limitadas.
- **Control del presupuesto:** Impide registrar o editar gastos que excedan lo disponible en el mes.
- **Navegación por periodos:** Consulta mensual, primera quincena o segunda quincena, y navegación entre meses.
- **Agrupación mensual:** La vista del mes suma los gastos de ambas quincenas.
- **Edición y eliminación:** Gestión directa de los gastos registrados.
- **Filtros por categoría:** Visualización rápida según el tipo de gasto.
- **Estadísticas:** Totales, promedio, gasto por categoría y comparación con el mes anterior.

## Tecnologías Utilizadas

- **Lenguaje:** JavaScript
- **Servidor:** Node.js HTTP
- **Interfaz:** HTML5 y CSS3
- **Cliente:** JavaScript mediante Fetch API
- **Pruebas:** Node.js Test Runner
- **Formato de datos:** JSON

## Arquitectura

```text
gestor-gastos/
├── public/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── src/
│   ├── server.js
│   ├── store.js
│   ├── validate.js
│   └── handlers/
└── test/
```

La aplicación separa la interfaz, el servidor, el almacenamiento y los controladores
de cada operación.

## Inicio Rápido

### Requisitos

- Node.js
- npm

### Ejecución

```bash
cd gestor-gastos
npm start
```

Abrir `http://localhost:3000`.

Para utilizar otro puerto:

```powershell
$env:PORT="3001"
npm start
```

## Pruebas

```bash
cd gestor-gastos
npm test
```

Las pruebas cubren registros, edición, eliminación, filtros, decimales,
presupuestos, periodos mensuales y quincenales, y estadísticas.

## API REST

| Método | Ruta | Descripción |
|:--|:--|:--|
| `GET` | `/expenses?month=YYYY-MM&period=month\|fortnight-1\|fortnight-2&category=Y` | Filtra gastos por mes, quincena y categoría |
| `POST` | `/expenses` | Registra un gasto con descripción, monto, categoría y fecha |
| `PUT` | `/expenses/:id` | Actualiza un gasto |
| `DELETE` | `/expenses/:id` | Elimina un gasto |
| `PUT` | `/budget` | Guarda el presupuesto mensual (`amount` y `month`) |
| `GET` | `/summary?month=YYYY-MM` | Obtiene totales y categorías del mes |

Los periodos son `month`, `fortnight-1` y `fortnight-2`. La vista mensual reúne
automáticamente los gastos de ambas quincenas.
