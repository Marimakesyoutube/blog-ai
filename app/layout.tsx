
import "../public/global.css";
import Link from "next/link";

export const metadata = { title: "MyDraftly", description: "Hands-free AI blog" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/new">New</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
