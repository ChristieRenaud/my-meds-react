import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { Routes, Route } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import MedsInfo from "./pages/MedsInfo"
import Layout from "./components/Layout"
import SelectedMedInfo from "./pages/SelectedMedInfo"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="/:id" element={<MedsInfo />} />
          <Route path="/:id/:info" element={<SelectedMedInfo />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
