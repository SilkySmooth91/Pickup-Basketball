// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
