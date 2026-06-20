import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { timeAgo, formatPeso, CATEGORIAS } from '../utils/helpers';
import { StatusBadge } from './ui/Badge';
import StarRating from './ui/StarRating';

export default function ChangaCard({ tarea }) {
  const cat = CATEGORIAS[tarea.categoria];

  return (
    <Link to={`/changas/${tarea.id}`} className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-2xl">{cat?.emoji || '⭐'}</span>
          <StatusBadge estado={tarea.estado} />
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
          {tarea.titulo}
        </h3>

        {/* Categoría */}
        <p className="text-xs text-primary-600 font-medium mb-3">{cat?.label}</p>

        {/* Descripción */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tarea.descripcion}</p>

        {/* Metadatos */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {tarea.zona}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {timeAgo(tarea.createdAt)}
          </span>
          {tarea._count?.postulaciones > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {tarea._count.postulaciones} postulado{tarea._count.postulaciones !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {tarea.contratante?.foto ? (
              <img src={tarea.contratante.foto} alt={tarea.contratante.nombre} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-xs">{tarea.contratante?.nombre?.[0]}</span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-700">{tarea.contratante?.nombre}</p>
              <div className="flex items-center gap-1">
                <StarRating value={tarea.contratante?.calificacionProm || 0} size="sm" />
                {tarea.contratante?.totalCalificaciones > 0 && (
                  <span className="text-xs text-gray-400">({tarea.contratante.totalCalificaciones})</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            {tarea.esAConvenir ? (
              <span className="text-sm font-semibold text-gray-500">A convenir</span>
            ) : tarea.presupuesto ? (
              <div>
                <p className="text-xs text-gray-400">Presupuesto</p>
                <p className="text-sm font-bold text-primary-700">{formatPeso(tarea.presupuesto)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
