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
      descripcion: 'Técnica en computación. Arreglo computadoras, instalo programas, enseño a usar el celular y la computadora. Mucha paciencia.',
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
      descripcion: 'Jubilado activo, necesito ayuda ocasional con trámites y mandados. Vivo en San Telmo.',
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
      descripcion: 'Enfermera con experiencia en cuidado de personas mayores y acompañamiento médico. Referencias disponibles.',
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
      descripcion: 'Hago mandados, compras y trámites bancarios. Conozco bien el barrio de Caballito y alrededores.',
      zona: 'Caballito',
      telefono: '011-1512-4567',
      foto: 'https://i.pravatar.cc/150?img=33',
      calificacionProm: 4.4,
      totalCalificaciones: 12,
      changasRealizadas: 15,
    },
  });

  // Changas
  const tarea1 = await prisma.tarea.create({
    data: {
      titulo: 'Necesito que vayan al ANSES a hacer un trámite',
      descripcion: 'Tengo que actualizar el CBU en ANSES pero no puedo moverme de casa. Necesito que vayan con todos los papeles (los tengo preparados) y hagan el trámite. La oficina queda en Av. de Mayo al 600. Pago viáticos y el servicio.',
      categoria: 'TRAMITES',
      zona: 'Almagro',
      presupuesto: 3500,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: juan.id,
      fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const tarea2 = await prisma.tarea.create({
    data: {
      titulo: 'Mudanza de monoambiente en Palermo',
      descripcion: 'Me mudo de un monoambiente a otro a 10 cuadras. Tengo cama de una plaza, ropero chico, mesa con 4 sillas, heladera pequeña y cajas. Se necesita camioneta o auto grande. Ayuda para cargar y descargar.',
      categoria: 'MUDANZAS',
      zona: 'Palermo',
      presupuesto: 8000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: maria.id,
      fotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    },
  });

  const tarea3 = await prisma.tarea.create({
    data: {
      titulo: 'Limpieza profunda 3 ambientes en Recoleta',
      descripcion: 'Limpieza general de departamento de 3 ambientes: living, habitación y cocina. Incluye baño, ventanas y balcón. Departamento sin uso hace 2 meses. Los productos de limpieza los proveo yo. Que sean 2 personas idealmente.',
      categoria: 'LIMPIEZA',
      zona: 'Recoleta',
      esAConvenir: true,
      estado: 'ABIERTA',
      contratanteId: juan.id,
    },
  });

  const tarea4 = await prisma.tarea.create({
    data: {
      titulo: 'Compras en el supermercado y farmacia',
      descripcion: 'Lista de compras en el Carrefour de Av. Rivadavia y luego pasar por la farmacia. Son unas 15-20 cosas. Te paso el dinero en efectivo + pago aparte por el servicio. Vivo en piso 3 con ascensor.',
      categoria: 'MANDADOS',
      zona: 'Floresta',
      presupuesto: 1500,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: roberto.id,
    },
  });

  const tarea5 = await prisma.tarea.create({
    data: {
      titulo: 'Arreglar mi computadora que no arranca',
      descripcion: 'Mi notebook HP no enciende más. Necesito que alguien la revise y me diga qué tiene. Idealmente que la pueda reparar en el momento. Si hay que comprar alguna pieza la acordamos aparte.',
      categoria: 'TECNOLOGIA',
      zona: 'Caballito',
      presupuesto: 2500,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: juan.id,
    },
  });

  const tarea6 = await prisma.tarea.create({
    data: {
      titulo: 'Acompañar a mi mamá al médico en el Italiano',
      descripcion: 'Mi mamá (78 años) tiene turno en el Hospital Italiano el miércoles a las 10am. Necesito que la busquen en Flores, la lleven en taxi y la acompañen durante la consulta (aprox 2 horas total). Que sea una persona paciente y de confianza.',
      categoria: 'ACOMPANAMIENTO_MEDICO',
      zona: 'Flores',
      presupuesto: 4000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: roberto.id,
      fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const tarea7 = await prisma.tarea.create({
    data: {
      titulo: 'Llevar un sillón de 2 cuerpos de Boedo a Villa del Parque',
      descripcion: 'Tengo un sillón grande (2 cuerpos, entra en una camioneta) que necesito llevar de Boedo a Villa del Parque. Unos 8 km. Necesito ayuda para cargarlo también, que seamos 2 personas mínimo.',
      categoria: 'DELIVERY',
      zona: 'Boedo',
      presupuesto: 5000,
      esAConvenir: false,
      estado: 'EN_CURSO',
      contratanteId: maria.id,
    },
  });

  const tarea8 = await prisma.tarea.create({
    data: {
      titulo: 'Cuidado de dos nenas de tarde (3 y 5 años)',
      descripcion: 'Busco niñera para cuidar a mis nenas martes y jueves de 14 a 18hs mientras yo trabajo. Que tenga experiencia con chicos, sea puntual y tenga referencias. Las nenas son re buenas.',
      categoria: 'CUIDADO_PERSONAS',
      zona: 'Villa Crespo',
      presupuesto: 3000,
      esAConvenir: false,
      estado: 'ABIERTA',
      contratanteId: ana.id,
    },
  });

  const tarea9 = await prisma.tarea.create({
    data: {
      titulo: 'Trámite en el Registro Civil para DNI nuevo',
      descripcion: 'Necesito que alguien saque turno y vaya al Registro Civil a sacar el duplicado de DNI de mi hijo (tengo todo listo: fotos, papeles). La sede queda en San Martín al 1500.',
      categoria: 'TRAMITES',
      zona: 'Palermo',
      esAConvenir: true,
      estado: 'ABIERTA',
      contratanteId: carlos.id,
    },
  });

  const tarea10 = await prisma.tarea.create({
    data: {
      titulo: 'Enseñarme a usar WhatsApp y el celular nuevo',
      descripcion: 'Acabo de comprar un celular Android y no entiendo nada. Necesito que alguien venga a casa y me enseñe a usar WhatsApp, mandar fotos, y usar el banco digital. Que tenga paciencia para explicar despacio.',
      categoria: 'TECNOLOGIA',
      zona: 'Almagro',
      presupuesto: 2000,
      esAConvenir: false,
      estado: 'COMPLETADA',
      contratanteId: juan.id,
    },
  });

  // Postulaciones
  await prisma.postulacion.create({
    data: {
      tareaId: tarea1.id,
      changadorId: maria.id,
      mensaje: '¡Hola! Tengo experiencia en trámites del ANSES, ya fui varias veces por otros vecinos. Conozco el sistema y sé cómo proceder para que salga en una sola visita. Disponible mañana o pasado.',
      precioOfrecido: 3000,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea1.id,
      changadorId: roberto.id,
      mensaje: 'Dale, puedo ir. Ya fui al ANSES de Mayo al 600 antes, conozco la oficina. Llevame los papeles y lo resuelvo.',
      precioOfrecido: 3500,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea6.id,
      changadorId: laura.id,
      mensaje: 'Soy enfermera con experiencia en adultos mayores. Puedo acompañar a tu mamá con toda la atención que merece. Tengo referencias de familias en Flores. Charlemos los detalles.',
      precioOfrecido: 4000,
      estado: 'PENDIENTE',
    },
  });

  await prisma.postulacion.create({
    data: {
      tareaId: tarea7.id,
      changadorId: carlos.id,
      mensaje: 'Tengo camioneta pick-up, podemos ir entre los dos a cargarlo sin drama. De Boedo a Villa del Parque son 20 minutos a esa hora.',
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
      comentario: '¡Excelente! Ana tuvo toda la paciencia del mundo para enseñarme. Ahora le mando fotos a los nietos por WhatsApp. Re recomendada.',
    },
  });

  await prisma.calificacion.create({
    data: {
      tareaId: tarea10.id,
      autorId: ana.id,
      destinatarioId: juan.id,
      puntaje: 5,
      comentario: 'Juan es muy agradable y se las rebuscó rapidísimo. Una experiencia linda trabajar con él.',
    },
  });

  // Mensajes del chat de tarea7
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
      contenido: 'Perfecto, a las 9 lo espero. Te mando la dirección exacta por acá.',
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
