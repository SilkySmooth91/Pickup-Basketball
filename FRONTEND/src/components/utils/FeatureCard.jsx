import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Componente riutilizzabile per le schede delle caratteristiche dell'app
 * 
 * @param {object} props - Le props del componente
 * @param {object} props.icon - L'icona FontAwesome da visualizzare 
 * @param {string} props.title - Il titolo della caratteristica
 * @param {string} props.description - La descrizione della caratteristica
 * @returns {JSX.Element} Scheda della caratteristica
 */
export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-orange-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-4">
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 ml-16">{description}</p>
    </div>
  );
}
