import { Routes, Route } from "react-router-dom";
import Home from '../component/Home'
import Chat from '../component/Chat'
import "./App.css"
import Login from "../component/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
