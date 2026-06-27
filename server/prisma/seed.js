const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  await prisma.calificacion.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.postulacion.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const maria = await prisma.user.create({
    data: {
      nombre: 'María García',
      email: 'maria@example.com',
      password: passwordHash,
      descripcion: 'Hago trámites, mandados y limpieza. Soy puntual y de confianza. Llevo 3 años haciendo changas en el barrio.',
      zona: 'Palermo',
      telefono: '011-1534-5678',
      foto: 'https://i.pravatar.cc/150?img=5',
      calificacionProm: 4.8,
      totalCalificaciones: 24,
      changasRealizadas: 31,
    },
  });

  const carlos = await prisma.user.create({
    data: {
      nombre: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      password: passwordHash,
      descripcion: 'Changador con camioneta. Especializado en mudanzas chicas, fletes y traslado de objetos. Disponible fines de semana.',
      zona: 'Flores',
      telefono: '011-1528-9012',
      foto: 'https://i.pravatar.cc/150?img=12',
      calificacionProm: 4.5,
      totalCalificaciones: 18,
      changasRealizadas: 22,
    },
  });

  const ana = await prisma.user.create({
    data: {
      nombre: 'Ana Martínez',
      email: 'ana@example.com',
      password: passwordHash,
      descripcion: 'Hago limpieza de vidrios, vereda y jardín. Trabajo prolija y rápido. Referencias disponibles.',
      zona: 'Belgrano',
      telefono: '011-1545-3456',
      foto: 'https://i.pravatar.cc/150?img=9',
      calificacionProm: 4.9,
      totalCalificaciones: 31,
      changasRealizadas: 38,
    },
  });

  const juan = await prisma.user.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: passwordHash,
      descripcion: 'Jubilado activo, necesito ayuda ocasional con trámites y el jardín. Vivo en San Telmo.',
      zona: 'San Telmo',
      telefono: '011-1567-1234',
      foto: 'https://i.pravatar.cc/150?img=17',
      calificacionProm: 4.2,
      totalCalificaciones: 8,
      changasRealizadas: 5,
    },
  });

  const laura = await prisma.user.create({
    data: {
      nombre: 'Laura Sánchez',
      email: 'laura@example.com',
      password: passwordHash,
      descripcion: 'Limpieza de vidrios y ventanas, barrido de vereda. Trabajo en altura con arnés. Zona norte GBA y CABA.',
      zona: 'Villa Crespo',
      telefono: '011-1578-6789',
      foto: 'https://i.pravatar.cc/150?img=25',
      calificacionProm: 4.7,
      totalCalificaciones: 15,
      changasRealizadas: 19,
    },
  });

  const roberto = await prisma.user.create({
    data: {
      nombre: 'Roberto Díaz',
      email: 'roberto@example.com',
      password: passwordHash,
      descripcion: 'Corto el pasto, hago jardinería básica y limpieza de exteriores. Tengo mis propias herramientas.',
      zona: 'Caballito',
      telefono: '011-1512-4567',
      foto: 'https://i.pravatar.cc/150?img=33',
      calificacionProm: 4.4,
      totalCalificaciones: 12,
      changasRealizadas: 15,
    },
  });

  // Changas — una por cada categoría + algunas extras para volumen
  const tarea1 = await prisma.tarea.create({
    data: {
      titulo: 'Cortar el pasto del jardín delantero',
      descripcion: 'Jardín pequeño (aprox 30m²) en casa de Palermo. El pasto está alto, necesita corte y rastrillado. Cuento con manguera, falta cortadora y operador. Disponible cualquier día de semana.',
      categoria: 'CORTE_PASTO',
      zona: 'Palermo',
      presupuesto: 4000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: juan.id,
      fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const tarea2 = await prisma.tarea.create({
    data: {
      titulo: 'Barrer y limpiar la vereda del local',
      descripcion: 'Local comercial en Caballito. Vereda de 15 metros lineales, hay hojas y tierra acumulada. Necesito barrido, levantado de residuos y lavado con agua. Lunes a las 7am antes de abrir.',
      categoria: 'BARRIDO_VEREDA',
      zona: 'Caballito',
      presupuesto: 2000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: maria.id,
    },
  });

  const tarea3 = await prisma.tarea.create({
    data: {
      titulo: 'Limpieza de vidrios exteriores — piso 4',
      descripcion: 'Departamento de 3 ambientes en piso 4 con balcón. Vidrios y ventanas externas sin limpiar hace 6 meses. Necesito alguien con experiencia en altura y sus propios materiales.',
      categoria: 'LIMPIEZA_VIDRIOS',
      zona: 'Recoleta',
      esAConvenir: true,
      estado: 'ABIERTA',
      contratanteId: juan.id,
    },
  });

  const tarea4 = await prisma.tarea.create({
    data: {
      titulo: 'Lavado de auto a domicilio (Volkswagen Gol)',
      descripcion: 'Necesito lavado exterior e interior de un VW Gol. Tengo espacio en el garaje con toma de agua. Que traigan sus propios productos. Preferentemente sábado a la mañana.',
      categoria: 'LAVADO_AUTO',
      zona: 'Floresta',
      presupuesto: 3500,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: roberto.id,
    },
  });

  const tarea5 = await prisma.tarea.create({
    data: {
      titulo: 'Mudanza de monoambiente en Palermo',
      descripcion: 'Me mudo de un monoambiente a otro a 10 cuadras. Tengo cama de una plaza, ropero chico, mesa con 4 sillas y cajas. Se necesita camioneta o auto grande. Ayuda para cargar y descargar.',
      categoria: 'MUDANZAS',
      zona: 'Palermo',
      presupuesto: 8000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: maria.id,
      fotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    },
  });

  const tarea6 = await prisma.tarea.create({
    data: {
      titulo: 'Trámite de actualización de CBU en ANSES',
      descripcion: 'Necesito que vayan al ANSES de Av. de Mayo al 600 a actualizar el CBU. Tengo todos los papeles listos. Pago viáticos y el servicio. Hay que ir en horario de mañana, de 9 a 12.',
      categoria: 'TRAMITES',
      zona: 'Almagro',
      presupuesto: 3500,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: juan.id,
      fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const tarea7 = await prisma.tarea.create({
    data: {
      titulo: 'Llevar un sillón de 2 cuerpos de Boedo a Villa del Parque',
      descripcion: 'Sillón grande que necesito mover de Boedo a Villa del Parque (unos 8 km). Necesito camioneta y ayuda para cargarlo entre dos personas.',
      categoria: 'MUDANZAS',
      zona: 'Boedo',
      presupuesto: 5000,
      esAConvenir: false,
      estado: 'EN_CURSO',
      contratanteId: maria.id,
    },
  });

  const tarea8 = await prisma.tarea.create({
    data: {
      titulo: 'Cortar pasto y desmalezar fondo de casa',
      descripcion: 'Fondo de casa de unos 50m². Hay pasto alto y maleza en los bordes. Si tenés desmalezadora mejor. La casa tiene salida por la galería, fácil acceso.',
      categoria: 'CORTE_PASTO',
      zona: 'Flores',
      esAConvenir: true,
      estado: 'ABIERTA',
      contratanteId: ana.id,
    },
  });

  const tarea9 = await prisma.tarea.create({
    data: {
      titulo: 'Sacar turno y hacer trámite en el Registro Civil',
      descripcion: 'Necesito sacar el duplicado de DNI de mi hijo menor. Tengo todo listo: fotos, partida de nacimiento, DNI propio. La sede queda en San Martín al 1500. Puede ser cualquier día de la semana.',
      categoria: 'TRAMITES',
      zona: 'Palermo',
      esAConvenir: true,
      estado: 'ABIERTA',
      contratanteId: carlos.id,
    },
  });

  const tarea10 = await prisma.tarea.create({
    data: {
      titulo: 'Lavado y encerado de camioneta Hilux',
      descripcion: 'Camioneta grande, necesita lavado exterior completo + encerado + limpieza de llantas. Tengo toma de agua en el garaje. Que traigan sus materiales.',
      categoria: 'LAVADO_AUTO',
      zona: 'Almagro',
      presupuesto: 5500,
      esAConvenir: false,
      estado: 'COMPLETADA',
      contratanteId: juan.id,
    },
  });

  // Postulaciones
  await prisma.postulacion.create({
    data: {
      tareaId: tarea1.id,
      changadorId: roberto.id,
      mensaje: 'Tengo cortadora a nafta y rastrillo. Puedo el miércoles o jueves a la tarde. El tamaño que describís lo resuelvo en una hora.',
      precioOfrecido: 3500,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea1.id,
      changadorId: maria.id,
      mensaje: 'Hola! Tengo cortadora eléctrica y puedo ir el martes. Ya hice varios jardines en Palermo, quedé bien con todos.',
      precioOfrecido: 4000,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea6.id,
      changadorId: maria.id,
      mensaje: 'Hola! Conozco el ANSES de Mayo al 600, ya fui por otros vecinos. Disponible el lunes a la mañana.',
      precioOfrecido: 3000,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea7.id,
      changadorId: carlos.id,
      mensaje: 'Tengo camioneta pick-up, podemos ir entre los dos a cargarlo sin problema. De Boedo a Villa del Parque son 20 minutos.',
      precioOfrecido: 4500,
      estado: 'ACEPTADA',
    },
  });

  // Calificaciones para la tarea completada
  await prisma.calificacion.create({
    data: {
      tareaId: tarea10.id,
      autorId: juan.id,
      destinatarioId: ana.id,
      puntaje: 5,
      comentario: 'Excelente trabajo, dejó la camioneta impecable. Muy prolija y puntual.',
    },
  });

  await prisma.calificacion.create({
    data: {
      tareaId: tarea10.id,
      autorId: ana.id,
      destinatarioId: juan.id,
      puntaje: 5,
      comentario: 'Juan es muy agradable y el lugar era fácil de trabajar. Recomendado.',
    },
  });

  // Mensajes del chat de tarea7 (EN_CURSO)
  await prisma.mensaje.create({
    data: {
      tareaId: tarea7.id,
      emisorId: maria.id,
      contenido: 'Hola Carlos! Gracias por postularte. ¿Cuándo podés?',
    },
  });

  await prisma.mensaje.create({
    data: {
      tareaId: tarea7.id,
      emisorId: carlos.id,
      contenido: '¡Buenas! Puedo el sábado a la mañana, ¿te viene bien a las 9?',
    },
  });

  await prisma.mensaje.create({
    data: {
      tareaId: tarea7.id,
      emisorId: maria.id,
      contenido: 'Perfecto, a las 9 los espero. Te mando la dirección exacta por acá.',
    },
  });

  console.log('✅ Seed completado. Usuarios de prueba:');
  console.log('   maria@example.com / password123');
  console.log('   carlos@example.com / password123');
  console.log('   ana@example.com / password123');
  console.log('   juan@example.com / password123');
  console.log('   laura@example.com / password123');
  console.log('   roberto@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
