import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ReportMissing from './pages/ReportMissing';
import ActiveAlerts from './pages/ActiveAlerts';
import ReportSighting from './pages/ReportSighting';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportMissing />} />
          <Route path="/alerts" element={<ActiveAlerts />} />
          <Route path="/sighting" element={<ReportSighting />} />
        </Routes>
      </Layout>
    </Router>
  );
}
