import { useState, useEffect } from "react";
import { fetchMeta, setMeta } from "haribote/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/articles/1", label: "Article 1" },
  { to: "/articles/2", label: "Article 2" },
];

async function navigate(url: string, setPage: (p: string) => void) {
  history.pushState(null, "", url);
  setPage(url);
  setMeta(await fetchMeta(url));
}

function PageContent({ page }: { page: string }) {
  if (page === "/") return <p>Home page</p>;
  if (page === "/about") return <p>About this site</p>;
  const match = page.match(/^\/articles\/(\w+)$/);
  if (match) return <p>Article {match[1]} detail</p>;
  return null;
}

export default function App() {
  const [page, setPage] = useState(location.pathname);

  useEffect(() => {
    const onPop = () => setPage(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div>
      <h1>haribote + React</h1>
      <nav>
        <ul>
          {links.map(({ to, label }) => (
            <li key={to}>
              <a
                href={to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(to, setPage);
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <PageContent page={page} />
    </div>
  );
}
