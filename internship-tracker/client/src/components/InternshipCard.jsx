import { Building2, MapPin, Calendar, ExternalLink, Pencil, Trash2, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { STATUS_STYLES, STATUS_DOT } from '../utils/statusConfig';

const InternshipCard = ({ internship, onEdit, onDelete }) => {
  const {
    company,
    role,
    status,
    applicationDate,
    deadline,
    location,
    mode,
    stipend,
    jobLink,
  } = internship;

  const isDeadlineSoon =
    deadline &&
    new Date(deadline) >= new Date() &&
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 3;

  return (
    <div className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">{role}</h3>
            <p className="text-sm text-gray-400">{company}</p>
          </div>
        </div>
        <span
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
          {status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-400">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {location} · {mode}
          </span>
        )}
        {stipend && (
          <span className="flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            {stipend}
          </span>
        )}
        {applicationDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Applied {format(new Date(applicationDate), 'dd MMM yyyy')}
          </span>
        )}
      </div>

      {deadline && (
        <p className={`text-xs font-medium ${isDeadlineSoon ? 'text-red-400' : 'text-gray-500'}`}>
          Deadline: {format(new Date(deadline), 'dd MMM yyyy')}
          {isDeadlineSoon && ' · Due soon!'}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-gray-800 pt-3">
        {jobLink ? (
          <a
            href={jobLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300"
          >
            View posting <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(internship)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-primary-400"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(internship)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;
