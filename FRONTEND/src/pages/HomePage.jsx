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

import WelcomeComp from '../components/WelcomeComp'
import Footer from '../components/utils/Footer'
import '../styles/map-fixes.css'

export default function HomePage() {
  return (
    <>
      <div className="home-page">      
        <div className="home-page-content">
          <WelcomeComp />
        </div>
        <div className="home-page-footer">
          <Footer showAboutLink={true} />
        </div>
      </div>
    </>
  )
}
