import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import HomeLayout from './components/Layout/HomeLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthRedirect from './components/Auth/AuthRedirect';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={
            <HomeLayout>
              <Home />
            </HomeLayout>
          } />
          <Route path="/login" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register" element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Layout>
                <Goals />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4ade80',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ef4444',
              },
            },
          }}
        />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
