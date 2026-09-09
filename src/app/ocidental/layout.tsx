import WesternNavigation from "../components/WesternNavigation";

export default function WesternLayout({ children }: { children: React.ReactNode }) {
  return <div className="western-workspaces western-world"><WesternNavigation />{children}</div>;
}
