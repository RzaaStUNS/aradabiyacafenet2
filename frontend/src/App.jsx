import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import TambahMenu from './pages/TambahMenu';
import PesananMasuk from './pages/PesananMasuk';
import Kasir from './pages/Kasir';
import RiwayatPesanan from './pages/RiwayatPesanan';
import Monitoring from './pages/Monitoring'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/tambah" element={<TambahMenu />} />
        <Route path="/pesanan-masuk" element={<PesananMasuk />} />
        <Route path="/kasir" element={<Kasir />} />
        <Route path="/riwayat" element={<RiwayatPesanan />} />
        <Route path="/monitoring" element={<Monitoring />} />
      </Routes>
    </Router>
  );
}

export default App;