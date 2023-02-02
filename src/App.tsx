import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TypingClub from './Components/Typing/typingClub';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import Login from './Components/Login/login';
import Notfound from './Components/404/notFound';

function App() {
  return (
    <div className="App">

    <BrowserRouter>
        <Routes>
          <Route  path="/" element={<Login/>} />
          <Route  path="/typing" element={<TypingClub/>} />
          <Route  path="*" element={<Notfound/>} />
        </Routes>
    </BrowserRouter>
      
      
    </div>
  );
}

export default App;
