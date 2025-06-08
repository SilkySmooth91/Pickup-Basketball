import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComments, addComment } from '../../api/commentApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faComments } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import FloatingLabel from './FloatingLabel';
import LoadingSpinner from './LoadingSpinner';

export default function CommentsSection({ targetId, targetType }) {
  const { user, accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComments(targetId, targetType, { accessToken }, currentPage, 10);
        setComments(data.comments);
        setTotalPages(data.totalPages);
        setTotalComments(data.totalComments);
      } catch (err) {
        if (err.message && err.message.includes('404')) {
          setError('Errore nel caricamento dei commenti');
        } else {
          setError('Errore sconosciuto nel caricamento dei commenti');
        }
        setComments([]);
        setTotalPages(1);
        setTotalComments(0);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [targetId, targetType, accessToken, currentPage]);  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(targetId, targetType, newComment, { accessToken });
      setNewComment('');
      // Dopo aver aggiunto un commento, torniamo alla prima pagina per mostrare il nuovo commento
      setCurrentPage(1);
      // Refetch comments della prima pagina
      const data = await getComments(targetId, targetType, { accessToken }, 1, 10);
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setTotalComments(data.totalComments);
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
      </div>      <div className="p-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ul className="space-y-3 mb-4">            {comments.length === 0 ? (
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
        
        {/* Paginazione */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between my-4 text-sm">
            <div className="text-gray-500">
              {totalComments > 0 ? `${totalComments} commenti totali` : 'Nessun commento'}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-100'}`}
                aria-label="Pagina precedente"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className="text-gray-700">
                Pagina {currentPage} di {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-100'}`}
                aria-label="Pagina successiva"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        )}
        
        {user && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 !mb-4">
            <FloatingLabel
              id="comment-textarea"
              asTextarea
              label="Aggiungi un commento..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={2}
              disabled={submitting}
              className="text-sm"
            />
            <button
              type="submit"
              className="self-end bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-md font-semibold text-base hover:from-orange-600 hover:to-red-600 transition disabled:cursor-not-allowed cursor-pointer"
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
