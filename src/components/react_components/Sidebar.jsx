import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-48 border-r border-slate-800">
      <div className="flex flex-col items-center justify-between">
        <ul className="menu menu-border w-full pr-0">
          <li className="menu-title">Menu</li>
          <li>
            <Link to="/">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9v9a1 1 0 01-1 1h-6m-6 0H4a1 1 0 01-1-1v-9z" />
              </svg>
              Home
            </Link>
          </li>
          <li>
            <Link to="/community">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m7-6a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Community
            </Link>
          </li>
          <li>
            <Link to="/discovery">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Discovery
            </Link>
          </li>
          <li>
            <Link to="/coming-soon">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 100-20 10 10 0 000 20z" />
              </svg>
              Coming Soon
            </Link>
          </li>
        </ul>

        <ul className="menu w-full pr-0 menu-border">
          <li className="menu-title">Social</li>
          <li>
            <Link to="/profile">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-3.314 0-6 2.239-6 5v1h12v-1c0-2.761-2.686-5-6-5z" />
              </svg>
              Profile
            </Link>
          </li>
          <li>
            <Link to="/friend">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m6-6a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              Friend
            </Link>
          </li>
          <li>
            <Link to="/media">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Media
            </Link>
          </li>
        </ul>

        <ul className="menu w-full pr-0 menu-border">
          <li className="menu-title">General</li>
          <li>
            <Link to="/settings">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Settings
            </Link>
          </li>
          <li>
            <Link to="/logout">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              Logout
            </Link>
          </li>
          <li>
            <Link to="/help">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M12 14a4 4 0 10-4-4 4 4 0 004 4z" />
              </svg>
              Help & Support
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
