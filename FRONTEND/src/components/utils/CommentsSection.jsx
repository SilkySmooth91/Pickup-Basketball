import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComments, addComment } from '../../api/commentApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faComments } from '@fortawesome/free-regular-svg-icons';

export default function CommentsSection({ targetId, targetType }) {
  const { user, accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComments(targetId, targetType, { accessToken });
        setComments(data);
      } catch (err) {
        if (err.message && err.message.includes('404')) {
          setError('Errore nel caricamento dei commenti');
        } else {
          setError('Errore sconosciuto nel caricamento dei commenti');
        }
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [targetId, targetType, accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(targetId, targetType, newComment, { accessToken });
      setNewComment('');
      // Refetch comments
      const data = await getComments(targetId, targetType, { accessToken });
      setComments(data);
    } catch (err) {
      setError('Errore durante l\'invio del commento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-xl min-w-[260px] border-orange-500 border-l-6 mt-8">
      <div className="bg-gradient-to-r from-orange-100 to-red-200 rounded-t-lg p-4 flex items-center">
        <FontAwesomeIcon icon={faComments} className="text-xl text-orange-500 pl-2" />
        <span className="font-semibold text-2xl pl-3">Commenti</span>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-500">Caricamento...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ul className="space-y-3 mb-4">
            {comments.length === 0 ? (
              <li className="text-gray-400 text-sm">Non ci sono ancora commenti. Aggiungine uno!</li>
            ) : (
              comments.map((c) => (
                <li key={c._id} className="bg-orange-50 rounded-md p-3 flex flex-col items-start gap-3">
                  <div className='flex items-center justify-start'>
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        {c.author?.avatar ? (
                          <img src={c.author.avatar} alt={c.author.username || 'Utente'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-200">
                            <FontAwesomeIcon icon={faComments} className="text-orange-400 text-lg" />
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-orange-600 text-sm ml-2">{c.author?.username || 'Utente'}</div>
                  </div>
                  <div className="flex flex-col flex-1 md:ml-11">
                    <span className="text-gray-700 text-sm">{c.text}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('it-IT')}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
        {user && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 !mb-4">
            <textarea
              className="border rounded p-2 text-sm resize-none focus:border-orange-700"
              rows={2}
              placeholder="Aggiungi un commento..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={submitting}/>
            <button
              type="submit"
              className="self-end bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-md font-semibold text-base hover:from-orange-600 hover:to-red-600 transition disabled:cursor-not-allowed"
              disabled={submitting || !newComment.trim()}>
              <FontAwesomeIcon icon={faComment} className='mr-2'/>
              {submitting ? 'Invio...' : 'Invia commento'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
