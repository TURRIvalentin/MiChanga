import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Star, Shield, Clock, MapPin, CheckCircle } from 'lucide-react';
import { CATEGORIAS } from '../utils/helpers';

const testimonios = [
  {
    nombre: 'Graciela M.',
    zona: 'Caballito',
    texto: 'Le pedí a María que me fuera al ANSES y volvió con todo resuelto. ¡Una genia! Tardé 5 minutos en encontrarla.',
    puntaje: 5,
    foto: 'https://i.pravatar.cc/80?img=47',
  },
  {
    nombre: 'Héctor B.',
    zona: 'Palermo',
    texto: 'Carlos me ayudó con la mudanza por una fracción de lo que pedía cualquier empresa. Profesional y puntual.',
    puntaje: 5,
    foto: 'https://i.pravatar.cc/80?img=57',
  },
  {
    nombre: 'Susana R.',
    zona: 'Flores',
    texto: 'Encontré a alguien para acompañar a mi mamá al médico en media hora. Este servicio es una bendición.',
    puntaje: 5,
    foto: 'https://i.pravatar.cc/80?img=44',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
              🇦🇷 El marketplace de changas en Argentina
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              ¿Necesitás que te den una mano?{' '}
              <span className="text-accent-400">Publicá tu changa.</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Conectamos personas que necesitan ayuda con changadores de confianza en tu barrio.
              Trámites, mudanzas, mandados, limpieza y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link to="/publicar" className="btn-accent text-lg py-4 px-8 flex items-center justify-center gap-2">
                  Publicar una changa <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-accent text-lg py-4 px-8 flex items-center justify-center gap-2">
                    Empezar gratis <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/changas" className="bg-white/10 hover:bg-white/20 text-white text-lg font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2">
                    Ver changas disponibles
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> Sin comisiones</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> Calificaciones verificadas</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> 100% argentino</span>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="h-12 bg-gray-50 rounded-t-[3rem]" />
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-3">¿Cómo funciona?</h2>
          <p className="text-center text-gray-500 mb-12 text-lg">Simple, rápido y sin vueltas</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Publicá tu changa',
                desc: 'Contá qué necesitás, dónde y cuánto estás dispuesto a pagar. Tarda 2 minutitos.',
                emoji: '📝',
                color: 'bg-primary-50 border-primary-200',
              },
              {
                step: '2',
                title: 'Recibís postulaciones',
                desc: 'Los changadores de tu zona se postulan con su precio y mensaje. Vos elegís al mejor.',
                emoji: '🙋',
                color: 'bg-accent-50 border-accent-200',
              },
              {
                step: '3',
                title: 'Coordinan y listo',
                desc: 'Chatean para acordar los detalles y al terminar se califican mutuamente.',
                emoji: '🤝',
                color: 'bg-green-50 border-green-200',
              },
            ].map((item) => (
              <div key={item.step} className={`card border-2 ${item.color} p-8 text-center`}>
                <div className="text-5xl mb-4">{item.emoji}</div>
                <div className="w-8 h-8 rounded-full bg-primary-600 text-primary-900 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-3">Categorías de changas</h2>
          <p className="text-center text-gray-500 mb-12 text-lg">De todo un poco, como en Argentina</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(CATEGORIAS).map(([key, cat]) => (
              <Link
                key={key}
                to={`/changas?categoria=${key}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border-2 border-transparent transition-all duration-150 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-150">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-primary-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué MiChanga */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">¿Por qué MiChanga?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Cerca tuyo',
                desc: 'Encontrá changadores en tu mismo barrio. Sin traslados largos ni precios inflados.',
                color: 'text-primary-600 bg-primary-50',
              },
              {
                icon: Star,
                title: 'Changadores calificados',
                desc: 'Cada changador tiene su historial y calificaciones de trabajos anteriores para que puedas elegir tranquilo.',
                color: 'text-accent-600 bg-accent-50',
              },
              {
                icon: Shield,
                title: 'Acordá el precio',
                desc: 'El presupuesto es orientativo. Coordinás directamente con el changador en el chat.',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: Clock,
                title: 'Rapidísimo',
                desc: 'Publicá en 2 minutos y empezás a recibir postulaciones casi al instante.',
                color: 'text-purple-600 bg-purple-50',
              },
            ].map((item) => (
              <div key={item.title} className="card p-6 flex gap-4">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-3">Lo que dicen los usuarios</h2>
          <p className="text-center text-gray-500 mb-12">Gente real de Buenos Aires</p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.nombre} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 italic">"{t.texto}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.foto} alt={t.nombre} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.zona}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            ¿Y vos? ¿Qué necesitás resolver hoy?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Unite a la comunidad de MiChanga. ¡Es gratis y tardás menos de un minuto!
          </p>
          <Link to={user ? '/publicar' : '/register'} className="btn-accent text-lg py-4 px-10 inline-flex items-center gap-2">
            {user ? 'Publicar una changa' : '¡Me sumo!'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white/50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MiChanga" className="h-7 w-auto" />
            <span className="text-sm">El marketplace de changas en Argentina 🇦🇷</span>
          </div>
          <p className="text-sm">Hecho con ❤️ en Buenos Aires</p>
        </div>
      </footer>
    </div>
  );
}
