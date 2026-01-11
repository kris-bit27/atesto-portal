import Link from "next/link";

export default function TopBar() {
  return (
    <div className="atesto-topbar">
      <div className="atesto-topbar-inner">
        <div className="atesto-brand">
          Atesto<span style={{ opacity: 0.7 }}>•</span>portál
        </div>
        <nav className="atesto-pillbar">
          <Link className="atesto-pill" href="/">Home</Link>
          <Link className="atesto-pill" href="/read">Read</Link>
          <Link className="atesto-pill" href="/review">Review</Link>
          <Link className="atesto-pill" href="/search">Search</Link>
          <Link className="atesto-pill" href="/editor">Editor</Link>
          <Link className="atesto-pill" href="/admin">Admin</Link>
        </nav>
      </div>
    </div>
  );
}
