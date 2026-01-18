import Link from "next/link";
import ReviewClient from "./review-client";


export default function ReviewPage() {
  return (
    <main className="atesto-container atesto-stack">
      <div className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-row" style={{ justifyContent: "space-between" }}>
            <div>
              <h1 className="atesto-h1" style={{ margin: 0 }}>REVIEW</h1>
              <div className="atesto-subtle">SRS light • otázky “k opakování”</div>
            </div>
            <div className="atesto-row">
              <Link className="atesto-btn" href="/">Dashboard</Link>
              <Link className="atesto-btn" href="/read">Read</Link>
              <Link className="atesto-btn" href="/search">Search</Link>
            </div>
          </div>
        </div>
      </div>

      <ReviewClient />
    </main>
  );
}
