import ProfilePageComp from '../components/profile-page/ProfilePageComp'
import HeaderComp from '../components/utils/HeaderComp'
import Footer from '../components/utils/Footer'
import { useParams } from 'react-router-dom'

export default function Profile() {
  const { userId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComp />
      <div className="flex-grow">
        <ProfilePageComp userId={userId} />
      </div>
      <Footer />
    </div>
  )
}
