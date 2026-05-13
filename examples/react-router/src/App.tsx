import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from "react-router-dom";
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
  return <p>About this site</p>;
}
function Article() {
  const { id } = useParams();
  return <p>Article {id} detail</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <MetaSync />
      <div>
        <h1>haribote + React Router</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/articles/1">Article 1</Link></li>
            <li><Link to="/articles/2">Article 2</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles/:id" element={<Article />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
