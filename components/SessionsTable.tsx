interface Session {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  max_participants: number;
  current_participants: number;
  description?: string;
  location?: string;
}

interface SessionsTableProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: number) => void;
}

export default function SessionsTable({ sessions, onEdit, onDelete }: SessionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr><th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Økt</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dato & Tid</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Sted</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Deltakere</th><th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Handlinger</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {sessions.map((session) => (
            <tr key={session.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-neutral-900">{session.title}</div>
                <div className="text-sm text-neutral-500">{session.instructor}</div>
                {session.description && (
                  <div className="mt-1 text-sm text-neutral-600">{session.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-900">{new Date(session.date).toLocaleDateString('no-NO')}</div>
                <div className="text-sm text-neutral-500">{session.time}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-neutral-900">{session.location || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-900">{session.current_participants} / {session.max_participants}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(session)} className="text-violet-600 hover:text-violet-900 mr-4">Rediger</button>
                <button onClick={() => onDelete(session.id)} className="text-red-600 hover:text-red-900">Slett</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
