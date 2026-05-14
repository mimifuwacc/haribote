import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { fetchMeta, setMeta } from "haribote/client";

function MetaSync() {
  const location = useLocation();
  useEffect(() => {
    fetchMeta(location.pathname).then(setMeta);
  }, [location.pathname]);
  return null;
}

function Home() {
  return <p>Home page</p>;
}

function About() {
  return <p>About this app</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <MetaSync />
      <div>
        <h1>My App</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
