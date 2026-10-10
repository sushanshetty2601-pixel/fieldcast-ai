import { useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import ModulePage from './pages/ModulePage.jsx'
import SunsetExplorerPage from './pages/SunsetExplorerPage/SunsetExplorerPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './styles/global.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [activeModule, setActiveModule] = useState(null)

  const navigateTo = (page, module = null) => {
    setCurrentPage(page)
    setActiveModule(module)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppProvider>
      <div className="app">
        <Navbar currentPage={currentPage} navigateTo={navigateTo} />
        <main className="app-main">
          {currentPage === 'home' && (
            <HomePage navigateTo={navigateTo} />
          )}
          {currentPage === 'module' && activeModule === 'suncast' && (
            <SunsetExplorerPage navigateTo={navigateTo} />
          )}
          {currentPage === 'module' && activeModule && activeModule !== 'suncast' && (
            <ModulePage module={activeModule} navigateTo={navigateTo} />
          )}
          {currentPage === 'history' && (
            <HistoryPage navigateTo={navigateTo} />
          )}
        </main>
      </div>
    </AppProvider>
  )
}
