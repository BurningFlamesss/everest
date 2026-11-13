import { notices, school } from "./school";

export { notices };

export const footerLinks = [
	["Home", "/"],
	["About", "/about"],
	["Courses", "/courses"],
	["Facilities", "/facilities"],
	["Faculty", "/faculty"],
	["Notices", "/notices"],
	["Scholarships", "/scholarship"],
	["Calendar", "/calendar"],
	["Gallery", "/gallery"],
	["Contact", "/contact"],
] as const;

export const nav = [
	["About", "/about"],
	["Courses", "/courses"],
	["Facilities", "/facilities"],
	["Faculty", "/faculty"],
	["Notices", "/notices"],
	["Scholarships", "/scholarship"],
	["Calendar", "/calendar"],
	["Gallery", "/gallery"],
] as const;

export const siteSchool = {
	name: school.nameEn,
	short: school.shortEn,
	nepali: school.nameNe,
	address: school.address.line1,
	phoneNtc: school.phones.find((p) => p.label === "NTC")?.value ?? "",
	phoneNcell: school.phones.find((p) => p.label === "Ncell")?.value ?? "",
	email: school.email,
	registration: school.regNo,
};
