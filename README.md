# Gestor de Gastos / Presupuesto Personal

Aplicación web + API REST (Node.js, sin dependencias externas) para registrar gastos,
editarlos, filtrarlos por categoría y ver cuánto queda del presupuesto.
Proyecto de la Tarea 3 de Programación III (Git y Git Flow).

## Uso

```bash
npm start     # abre http://localhost:3000 en el navegador
npm test      # corre las pruebas automáticas
```

## API

| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| POST   | /expenses               | Registrar un gasto                   |
| GET    | /expenses?category=X    | Listar gastos (filtro opcional)      |
| PUT    | /expenses/:id           | Editar monto, categoría, etc.        |
| DELETE | /expenses/:id           | Eliminar un gasto                    |
| PUT    | /budget                 | Definir el presupuesto               |
| GET    | /summary                | Total gastado, restante y por categoría |

## Flujo de ramas (Git Flow)

`main` (producción) <- `qa` <- `dev` <- `feature/*` y `hotfix/*`

Cada rama se integra con 3 Pull Requests: hacia `dev`, `qa` y `main`.
