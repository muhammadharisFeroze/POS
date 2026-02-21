import '@ui5/webcomponents/dist/Assets.js';
import '@ui5/webcomponents-react/dist/Assets.js';
import '@ui5/webcomponents-fiori/dist/Assets.js';
import { ThemeProvider } from '@ui5/webcomponents-react';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
