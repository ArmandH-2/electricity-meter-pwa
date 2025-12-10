import { useState } from 'react';
import { Layout } from './components/Layout';
import { MeterReadingPage } from './pages/MeterReading';
import { BillCollectionPage } from './pages/BillCollection';
import { OverviewPage } from './pages/Overview';
import { ToastProvider } from './components/ToastProvider';

import { LogsPage } from './pages/Logs';

function App() {
  const [mode, setMode] = useState<'overview' | 'reading' | 'collection' | 'logs'>('overview');

  return (
    <ToastProvider>
      <Layout currentMode={mode} onModeChange={setMode}>
        {mode === 'overview' && <OverviewPage onNavigate={setMode} />}
        {mode === 'reading' && <MeterReadingPage />}
        {mode === 'collection' && <BillCollectionPage />}
        {mode === 'logs' && <LogsPage />}
      </Layout>
    </ToastProvider>
  );
}

export default App;
