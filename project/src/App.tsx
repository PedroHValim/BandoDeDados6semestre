import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RoomsPage from './pages/RoomsPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ?
            <Navigate to="/rooms" replace /> :
            <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
          }
        />
        <Route
          path="/rooms"
          element={
            isAuthenticated ?
            <RoomsPage onLogout={() => setIsAuthenticated(false)} /> :
            <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
