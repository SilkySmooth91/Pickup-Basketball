import '../../styles/BasketballSpinner.css';
import basketballImage from '../../assets/basketball-marker.png';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="flex flex-col items-center">
        <div className="basketball-spinner-container mb-4">
          <img 
            src={basketballImage} 
            alt="Basketball" 
            className="basketball-spinner-ball"/>
          <div className="basketball-spinner-shadow"></div>
        </div>
        <span className="text-gray-700">Caricamento...</span>
      </div>
    </div>
  );
}
