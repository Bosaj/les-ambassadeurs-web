import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import NewsPage from './pages/NewsPage';
import ProgramsPage from './pages/ProgramsPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="donate" element={<Donate />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="programs" element={<ProgramsPage />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
