-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ABIERTA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TRAMITES', 'MANDADOS', 'MUDANZAS', 'DELIVERY', 'LIMPIEZA', 'TECNOLOGIA', 'CUIDADO_PERSONAS', 'ACOMPANAMIENTO_MEDICO', 'OTROS');

-- CreateEnum
CREATE TYPE "PagoEstado" AS ENUM ('PENDIENTE', 'PROCESANDO', 'RETENIDO', 'LIBERADO', 'REEMBOLSADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "foto" TEXT,
    "descripcion" TEXT,
    "zona" TEXT,
    "telefono" TEXT,
    "calificacionProm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCalificaciones" INTEGER NOT NULL DEFAULT 0,
    "changasRealizadas" INTEGER NOT NULL DEFAULT 0,
    "esChangador" BOOLEAN NOT NULL DEFAULT true,
    "esContratante" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "Category" NOT NULL,
    "zona" TEXT NOT NULL,
    "presupuesto" DOUBLE PRECISION,
    "esAConvenir" BOOLEAN NOT NULL DEFAULT false,
    "estado" "TaskStatus" NOT NULL DEFAULT 'ABIERTA',
    "fotos" TEXT[],
    "fechaLimite" TIMESTAMP(3),
    "precioAcordado" DOUBLE PRECISION,
    "precioAcordadoPropuesto" DOUBLE PRECISION,
    "precioAcordadoPropuestoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contratanteId" TEXT NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "precioOfrecido" DOUBLE PRECISION,
    "estado" "ApplicationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "changadorId" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emisorId" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" "PagoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "mercadoPagoPaymentId" TEXT,
    "mercadoPagoPreferenceId" TEXT,
    "externalReference" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLiberacion" TIMESTAMP(3),
    "tareaId" TEXT NOT NULL,
    "pagadorId" TEXT NOT NULL,
    "receptorId" TEXT NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_changadorId_tareaId_key" ON "Postulacion"("changadorId", "tareaId");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_autorId_tareaId_key" ON "Calificacion"("autorId", "tareaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_externalReference_key" ON "Pago"("externalReference");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_tareaId_key" ON "Pago"("tareaId");

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_changadorId_fkey" FOREIGN KEY ("changadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
