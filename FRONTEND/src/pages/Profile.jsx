import ProfilePageComp from '../components/profile-page/ProfilePageComp'
import HeaderComp from '../components/utils/HeaderComp'
import { useParams } from 'react-router-dom'

export default function Profile() {
  const { userId } = useParams();
  
  return (
    <>
        <HeaderComp />
        <ProfilePageComp userId={userId} />
    </>
  )
}
