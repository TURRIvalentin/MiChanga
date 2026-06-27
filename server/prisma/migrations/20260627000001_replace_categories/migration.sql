-- Eliminar changas y todos los datos relacionados
-- (CASCADE en FK maneja Postulacion, Mensaje, Calificacion, Pago automáticamente)
DELETE FROM "Tarea";

-- Resetear estadísticas de usuarios (sus calificaciones quedan sin changas)
UPDATE "User" SET "calificacionProm" = 0, "totalCalificaciones" = 0, "changasRealizadas" = 0;

-- Convertir la columna a TEXT para poder eliminar el enum viejo
ALTER TABLE "Tarea" ALTER COLUMN "categoria" TYPE TEXT;

-- Eliminar el enum viejo
DROP TYPE "Category";

-- Crear el nuevo enum con las 7 categorías definitivas
CREATE TYPE "Category" AS ENUM (
  'CORTE_PASTO',
  'BARRIDO_VEREDA',
  'LIMPIEZA_VIDRIOS',
  'LAVADO_AUTO',
  'MUDANZAS',
  'TRAMITES',
  'OTROS'
);

-- Restaurar la columna al nuevo enum (la tabla está vacía, sin riesgo de conversión)
ALTER TABLE "Tarea" ALTER COLUMN "categoria" TYPE "Category" USING "categoria"::"Category";
