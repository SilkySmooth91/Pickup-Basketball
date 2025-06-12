import '../../styles/BasketballSpinner.css';
import basketballImage from '../../assets/basketball-marker.png';

export default function LoadingSpinner({ size = "default", showText = true }) {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "scale-50 w-4 h-4";
      case "md":
        return "scale-75 w-6 h-6";
      case "lg":
        return "scale-100 w-8 h-8";
      default:
        return "scale-100 w-8 h-8";
    }
  };

  return (
    <div className={`flex items-center justify-center ${size === "default" ? "min-h-screen" : ""} bg-transparent`}>
      <div className="flex flex-col items-center">
        <div className={`basketball-spinner-container ${size !== "default" ? "mb-0" : "mb-4"} ${getSizeClass()}`}>
          <img 
            src={basketballImage} 
            alt="Basketball" 
            className="basketball-spinner-ball"/>
          <div className="basketball-spinner-shadow"></div>
        </div>
        {showText && size === "default" && <span className="text-gray-700">Caricamento...</span>}
      </div>
    </div>
  );
}
