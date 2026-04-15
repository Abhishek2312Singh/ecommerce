import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './pages/Header.jsx';
import Footer from './pages/Footer.jsx';

function App() {
 return (
    <div>
      <BrowserRouter>

      <Header/>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>

    <Footer/>
    </div>
  );
};

export default App;
