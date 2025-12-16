import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ToastViewport from './ToastViewport.jsx';

export default function Layout() {
  return (
    <div className="appFrame">
      <div className="bgFX" aria-hidden="true" />
      <Navbar />
      <main className="appMain">
        <Outlet />
      </main>
      <Footer />
      <ToastViewport />
    </div>
  );
}
