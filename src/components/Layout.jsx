import EditableText from "../editor/EditableText";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";
import cv from "../assets/Huilin_Huang_CV.pdf";
import "./Layout.css";

const links = [
  ["/", "Home"],
  ["/research", "Research"],
  ["/ourteam", "People"],
  ["/publications", "Publications"],
  ["/teaching", "Teaching"],
  ["/opportunities", "Opportunities"],
];

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const title =
      links.find(([path]) => path === pathname)?.[1] || "Page not found";
    document.title = title + " | Huilin Huang · CLIMATE EXTREMES &amp; EARTH SYSTEM LAB";
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname]);
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main-content"><EditableText contentKey="Layout.text001" /></a>
      <Header key={pathname} />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link className="footer-name" to="/"><EditableText contentKey="Layout.text002" /><span><EditableText contentKey="Layout.text003" /></span>
            </Link>
            <p><EditableText contentKey="Layout.text004" /><br /><EditableText contentKey="Layout.text005" /></p>
          </div>
          <div>
            <span className="eyebrow"><EditableText contentKey="Layout.text006" /></span>
            <p><EditableText contentKey="Layout.text007" /><br /><EditableText contentKey="Layout.text008" /><br /><EditableText contentKey="Layout.text009" /></p>
          </div>
          <div>
            <span className="eyebrow"><EditableText contentKey="Layout.text010" /></span>
            <a className="footer-contact" href="mailto:mgh4rc@virginia.edu"><EditableText contentKey="Layout.text011" /><FiArrowUpRight />
            </a>
            <a
              className="text-link"
              href={cv}
              download="Huilin_Huang_CV_Dec2025.pdf"
            ><EditableText contentKey="Layout.text012" /><span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Huilin Huang</span>
          <span><EditableText contentKey="Layout.text013" /></span>
        </div>
      </footer>
    </>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Huilin Huang lab home">
          <span className="brand-mark" aria-hidden="true"><EditableText contentKey="Layout.text014" /><span>.</span>
          </span>
          <span><EditableText contentKey="Layout.text015" /><small><EditableText contentKey="Layout.text016" /></small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document.querySelector(".menu-toggle")?.focus();
            }
          }}
        >
          {links.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === "/"}>
              {label}
            </NavLink>
          ))}
          <a href="mailto:mgh4rc@virginia.edu" className="nav-contact"><EditableText contentKey="Layout.text017" /><FiArrowUpRight />
          </a>
        </nav>
      </div>
    </header>
  );
}
