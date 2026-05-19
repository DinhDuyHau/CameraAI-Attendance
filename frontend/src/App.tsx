import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LiveMonitoring from './components/LiveMonitoring';
import Employees from './components/Employees';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Logs from './components/Logs';
import Devices from './components/Devices';
import { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'live':
        return <LiveMonitoring />;
      case 'employees':
        return <Employees />;
      case 'reports':
        return <Reports />;
      case 'logs':
        return <Logs />;
      case 'devices':
        return <Devices />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
