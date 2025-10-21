import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PrizeProvider } from './contexts/PrizeContext'
import ConfigPage from './pages/ConfigPage'
import LotteryPage from './pages/LotteryPage'

function App() {
  return (
    <PrizeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConfigPage />} />
          <Route path="/lottery" element={<LotteryPage />} />
        </Routes>
      </BrowserRouter>
    </PrizeProvider>
  )
}

export default App
