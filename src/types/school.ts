export interface SchoolConfig {
	organization: {
		name: string;
		shortName?: string;
		slug: string;
		tagline?: string;
		address?: string;
	};
	theme: {
		template: "modern";
		primary: `#${string}`;
		accent?: `#${string}`;
		background?: `#${string}`;
		sidebar?: `#${string}`;
	};
	features: {
		clubs: boolean;
		events: boolean;
		notices: boolean;
	};
	contact: {
		phone: string;
		email: string;
		address?: string;
		hours?: Array<{ label: string; value: string }>;
		mapImage?: string;
	};
	socials?: Array<{ label: string; href: string }>;
	seo: {
		title: string;
		description: string;
		ogImage?: string;
	};
}

export interface SchoolContent {
	sidebar: SidebarContent;
	login: {};
}

export interface SidebarContent {
	logo: string;
	tagline: string;
	collapsible: Record<string, ItemDetail>;
}

export interface ItemDetail {
	id: string;
	label: string;
	icon?: string;
	href?: string;
	external?: boolean;
	src?: string;
	content?: string;
	children?: Array<ItemDetail>;
}
