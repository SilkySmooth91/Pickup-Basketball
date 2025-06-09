import WelcomeComp from '../components/WelcomeComp'
import Footer from '../components/utils/Footer'
import '../styles/map-fixes.css'

export default function HomePage() {
  return (
    <div className="home-page">      
      <div className="home-page-content">
        <WelcomeComp />
      </div>
      <div className="home-page-footer">
        <Footer showAboutLink={true} />
      </div>
    </div>
  )
}
