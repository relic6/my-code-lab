import { Routes, Route } from 'react-router-dom';
import Lab from './Lab';
import ArkPage from '../components/react/the-ark/ArkPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lab />} />
      <Route path="/ark" element={<ArkPage />} />
    </Routes>
  );
}

export default App;
