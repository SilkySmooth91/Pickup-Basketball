/**
 * Componente spinner di caricamento
 * Visualizza un'animazione di caricamento centrata nella pagina
 */
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-gray-700">Caricamento...</span>
      </div>
    </div>
  );
}
