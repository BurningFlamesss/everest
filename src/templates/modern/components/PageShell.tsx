import type React from "react";
import Footer from "./Footer";
import NoticeTicker from "./NoticeTicker";
import SidebarNav from "./SidebarNav";
export default function PageShell({
	children,
	footer = true,
}: {
	children: React.ReactNode;
	footer?: boolean;
}) {
	return (
		<>
			<a href="#main" className="skip-link" data-testid="skip-to-content">
				Skip to content
			</a>
			<SidebarNav />
			<div className="page">
				<NoticeTicker />
				<main id="main" tabIndex={-1}>
					{children}
				</main>
				{footer && <Footer />}
			</div>
		</>
	);
}
