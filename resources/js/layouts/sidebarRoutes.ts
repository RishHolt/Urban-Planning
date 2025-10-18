import { report } from "process";

export interface SidebarRoute {
	label: string;
	path: string;
	icon: string;
	roles?: string[];
	children?: SidebarRoute[];
}

// Base routes - Main Dashboard
export const baseRoutes: SidebarRoute[] = [
	{
		label: "Main Dashboard",
		path: "/dashboard",
		icon: "LayoutDashboard",
		roles: ['IT_ADMIN']
	}
];

// Module routes - All application modules
export const moduleRoutes: SidebarRoute[] = [
	{
		label: "Zoning Clearance",
		path: "/zoning",
		icon: "Map",
		roles: ['IT_ADMIN', 'ZONING_ADMIN', 'ZONING_OFFICER'],
		children: [
			{ label: "Dashboard", path: "/zoning", icon: "LayoutDashboard" },
			{ label: "Applications", path: "/zoning/applications", icon: "FileText" },
			{ label: "Zoning Map", path: "/zoning/admin/map", icon: "MapPin" },
			{ label: "Logs", path: "/zoning/logs", icon: "History" }
		]
	},
	{
		label: "Building Review",
		path: "/building",
		icon: "Building2",
		roles: ['IT_ADMIN', 'BUILDING_ADMIN', 'BUILDING_OFFICER'],
		children: [
			{ label: "Dashboard", path: "/building", icon: "LayoutDashboard" },
			{ label: "Technical Review", path: "/building/review", icon: "FileText" },
			{ label: "Applications", path: "/building/applications", icon: "FileText" },
			{ label: "Logs", path: "/building/logs", icon: "History" }
		]
	},
	{
		label: "Housing Registry",
		path: "/housing",
		icon: "Home",
		roles: ['IT_ADMIN', 'HOUSING_ADMIN', 'HOUSING_OFFICER', 'HOUSING_INSPECTOR'],
		children: [
			{ label: "Dashboard", path: "/housing", icon: "LayoutDashboard" },
			{ label: "Applications", path: "/housing/applications", icon: "FileText" },
			{ label: "Logs", path: "/housing/logs", icon: "History" }
		]
	},
	{
		label: "Occupancy Monitoring",
		path: "/occupancy",
		icon: "Building",
		roles: ['IT_ADMIN', 'HOUSING_ADMIN', 'HOUSING_OFFICER', 'HOUSING_INSPECTOR'],
		children: [
			{ label: "Dashboard", path: "/occupancy", icon: "LayoutDashboard" },
			{ label: "Occupancy Records", path: "/occupancy/records", icon: "FileText" },
			{ label: "Inspections", path: "/occupancy/inspections", icon: "ClipboardCheck" },
			{ label: "Logs", path: "/occupancy/logs", icon: "History" }
		]
	},
	{
		label: "Infrastructure Project Coordination",
		path: "/infrastructure",
		icon: "Building2",
		roles: ['IT_ADMIN', 'INFRA_ADMIN', 'INFRA_ENGINEER', 'INFRA_OFFICER'],
		children: [
			{ label: "Dashboard", path: "/infrastructure", icon: "LayoutDashboard" },
			{ label: "Projects", path: "/infrastructure/projects", icon: "ClipboardList" },
			{ label: "Contractors", path: "/infrastructure/contractors", icon: "Users" },
			{ label: "Inspections", path: "/infrastructure/inspections", icon: "ClipboardCheck" },
			{ label: "Reports", path: "/infrastructure/reports", icon: "FileText" },
			{ label: "Logs", path: "/infrastructure/logs", icon: "History" }
		]
	},
	
	{
		label: "User Management",
		path: "/user-management",
		icon: "Users",
		roles: ['IT_ADMIN']
	},
	// {
	// 	label: "Application Logs",
	// 	path: "/admin/logs",
	// 	icon: "FileText",
	// 	roles: ['IT_ADMIN', 'ZONING_ADMIN', 'ZONING_OFFICER', 'BUILDING_ADMIN', 'BUILDING_OFFICER']
	// }
];

/**
 * Get filtered sidebar routes based on user role
 * @param userRole - The current user's role
 * @returns Filtered array of sidebar routes
 */
export const getFilteredRoutes = (userRole: string | undefined): SidebarRoute[] => {
	if (!userRole) return [];
	
	return [...baseRoutes, ...moduleRoutes].filter(route => 
		route.roles?.includes(userRole) ?? false
	);
};

