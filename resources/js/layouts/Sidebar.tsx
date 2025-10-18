import React, { useState, useEffect, useMemo } from "react";
import Logo from "../assets/Logo.svg";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
	LayoutDashboard,
	Map,
	Building2,
	Home,
	Users,
	Building,
	Network,
	User,
	Settings,
	LogOut,
	FileText,
	MapPin,
	UserPlus,
	CheckCircle,
	AlertTriangle,
	Wrench,
	History,
	ArrowLeft,
	Eye,
	ClipboardCheck,
	ClipboardList,
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import Swal from "../components/Swal";
import { SidebarRoute, getFilteredRoutes } from "./sidebarRoutes";

interface SidebarProps {
	onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
	const { url } = usePage();
	
	// Get user from localStorage
	const savedUser = localStorage.getItem('user');
	const user = savedUser ? JSON.parse(savedUser) : null;

	// Memoize sidebar routes to prevent infinite loops
	const sidebarRoutes = useMemo(() => {
		return getFilteredRoutes(user?.role);
	}, [user?.role]); // Only recompute when user role changes

	// Close dropdown when navigating to a route that doesn't have children
	useEffect(() => {
		const currentRoute = sidebarRoutes.find(route => {
			// Check if current path matches the route exactly
			if (route.path === url) return true;
			
			// Check if current path matches any child route exactly
			if (route.children && route.children.some((child: SidebarRoute) => child.path === url)) {
				return true;
			}
			
			// Check if current path is a nested path under any child route
			if (route.children) {
				return route.children.some((child: SidebarRoute) => 
					url.startsWith(child.path + '/') || url === child.path
				);
			}
			
			return false;
		});
		
		// Only close dropdown if we're not on a child route of any dropdown
		if (!currentRoute || !currentRoute.children || currentRoute.children.length === 0) {
			setOpenDropdown(null);
		} else {
			// If we're on a child route or nested route, keep that dropdown open
			setOpenDropdown(currentRoute.label);
		}
	}, [url, sidebarRoutes]);

	// Close profile dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (isProfileDropdownOpen && !target.closest('.profile-dropdown-container')) {
				setIsProfileDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isProfileDropdownOpen]);

	// Removed auto-open dropdown behavior - let users manually open dropdowns

	const handleDropdown = (label: string, route: SidebarRoute) => {
		const isCurrentlyOpen = openDropdown === label;
		
		if (isCurrentlyOpen) {
			// If dropdown is open, close it
			setOpenDropdown(null);
		} else {
			// If dropdown is closed, just open it (don't navigate automatically)
			setOpenDropdown(label);
		}
	};

	const isRouteActive = (path: string, children?: any[]) => {
		// For routes with children, check if any child path matches current location or is a parent of current location
		if (children && children.length > 0) {
			return children.some(child => 
				url === child.path || 
				url.startsWith(child.path + '/')
			);
		}
		// For routes without children, check direct path match
		return url === path;
	};

	const isChildActiveWithGrandchildren = (child: any) => {
		// Check if child path matches exactly
		if (url === child.path) return true;
		
		// Check if we're on a grandchild route
		if (child.children && child.children.length > 0) {
			return child.children.some((grandchild: any) => 
				url === grandchild.path
			);
		}
		
		return false;
	};

	const iconMap: Record<string, React.ElementType> = {
		LayoutDashboard,
		Map,
		Building2,
		Home,
		Building,
		Users,
		Network,
		FileText,
		MapPin,
		UserPlus,
		CheckCircle,
		AlertTriangle,
		Wrench,
		History,
		Eye,
		Settings,
		ClipboardCheck,
		ClipboardList,
	};

	// Routes are already filtered in getSidebarRoutes() based on user role

	const handleLogout = async () => {
		const result = await Swal.confirm(
			'Logout Confirmation',
			'Are you sure you want to logout?',
			{
				confirmButtonText: 'Yes, logout',
				cancelButtonText: 'Cancel',
				confirmButtonColor: '#dc2626',
				cancelButtonColor: '#6b7280',
				icon: 'question'
			}
		);

		if (result.isConfirmed) {
			localStorage.removeItem('user');
			router.visit('/');
		}
	};

	return (
		<div className="flex flex-col bg-surface w-full h-full shadow-lg">
			{/* Fixed width inner container - prevents content from flexing */}
			<div className="w-72 flex flex-col h-full">
				{/* Logo and title */}
				<div className="flex items-center space-x-4 bg-primary px-4 w-full h-18 shadow-md">
					<div className="bg-surface p-1 rounded-full size-fit shadow-sm">
						<img src={Logo} alt="Urban Planning Logo" className="w-auto h-12" />
					</div>
					<div className="flex flex-col">
						<h1 className="font-bold text-white text-xl">Urban Planning</h1>
						<span className="text-white/90 text-sm">Management System</span>
					</div>
				</div>
				<div className="flex flex-col flex-1 bg-background p-4 border-border border-r-2 size-full overflow-y-auto custom-scrollbar">

					{/* Navigation links */}
					{sidebarRoutes.map((route) => {
						const Icon = route.icon ? iconMap[route.icon] : null;
						const isActive = isRouteActive(route.path, route.children);
						const isDropdownOpen = openDropdown === route.label;
						
						return (
							<div key={route.label} className="mb-2">
								{route.children && route.children.length > 0 ? (
									<div>
										<button
											className={`
												flex justify-between items-center w-full px-4 py-3 rounded-theme-lg
												text-left transition-all duration-200 ease-in-out
												group relative overflow-hidden
												${isActive
													? 'bg-primary text-white shadow-theme-md font-semibold'
													: 'text-gray-600 hover:bg-primary/10 hover:shadow-theme-sm'
												}
												${isDropdownOpen ? 'ring-2 ring-primary/20' : ''}
											`}
											onClick={() => handleDropdown(route.label, route)}
											aria-expanded={isDropdownOpen}
											aria-label={`${route.label} menu`}
										>
											<span className="flex items-center gap-3">
												{Icon && (
													<Icon 
														size={20} 
														className={`transition-colors ${isActive ? 'text-white' : 'text-primary/80 group-hover:text-primary'}`} 
													/>
												)}
												<span className="text-sm">{route.label}</span>
											</span>
											<div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
												<ChevronDown 
													size={18} 
													className={`${isActive ? 'text-white/80' : 'text-primary/60 group-hover:text-primary/80'}`} 
												/>
											</div>
										</button>
										<div 
											className={`
												overflow-hidden transition-all duration-300 ease-in-out
												${isDropdownOpen 
													? 'max-h-96 opacity-100 mt-2' 
													: 'max-h-0 opacity-0 mt-0'
												}
											`}
										>
											<div className="flex flex-col gap-1 ml-6 pl-4 border-primary/20 border-l-2">
												{route.children.map((child: SidebarRoute) => {
													const isChildActiveState = isChildActiveWithGrandchildren(child);
													const ChildIcon = child.icon ? iconMap[child.icon] : null;
													return (
														<Link
															key={child.label}
															href={child.path}
															className={`
																block px-3 py-2 rounded-md text-sm
																transition-all duration-200 ease-in-out
																relative group
																${isChildActiveState
																	? 'bg-secondary/15 text-secondary border-l-3 border-accent'
																	: 'text-gray-700 hover:bg-secondary/10 hover:text-primary hover:translate-x-1'
																}
															`}
														>
															<span className="z-10 relative flex items-center gap-3">
																{ChildIcon && (
																	<ChildIcon 
																		size={16} 
																		className={`transition-colors ${isChildActiveState ? 'text-secondary' : 'text-primary/60 group-hover:text-primary'}`} 
																	/>
																)}
																{child.label}
															</span>
															{isChildActiveState && (
																<div className="absolute inset-0 bg-primary/10 rounded-md" />
															)}
														</Link>
													);
												})}
											</div>
										</div>
									</div>
								) : (
									<Link
										href={route.path}
										className={`
											block px-4 py-3 rounded-theme-lg
											transition-all duration-200 ease-in-out
											group relative overflow-hidden
											${isActive
												? 'bg-primary text-white shadow-theme-md font-bold'
												: 'text-primary hover:bg-primary/10 hover:shadow-theme-sm'
											}
										`}
									>
										<span className="z-10 relative flex items-center gap-3">
											{Icon && (
												<Icon 
													size={20} 
													className={`transition-colors ${isActive ? 'text-white' : 'text-primary/80 group-hover:text-primary'}`} 
												/>
											)}
											<span className="text-sm">{route.label}</span>
										</span>
										{isActive && (
											<div className="absolute inset-0 bg-primary rounded-lg" />
										)}
									</Link>
								)}
							</div>
						);
					})}
					
					{/* Profile dropdown at bottom */}
					<div className="flex flex-1 items-end">
						<div className="profile-dropdown-container relative w-full mt-4 pt-4 border-border border-t-2">
							{/* Profile card button */}
							<button
								onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
								className="flex flex-row items-center space-x-4 bg-secondary/10 hover:bg-secondary/20 px-4 py-3 rounded-theme-lg w-full text-secondary transition-all duration-200 hover:shadow-theme-sm group"
							>
								<div className="bg-surface shadow-theme-sm p-1 rounded-full">
									<div className="bg-accent p-2 rounded-full size-fit">
										<User className="text-white"/>
									</div>
								</div>
								<div className="flex flex-col flex-1 text-left">
									<span className="text-secondary text-sm font-medium">
										Welcome! {user?.role?.replace('_', ' ').toLowerCase()}.
									</span>
									<span className="font-semibold text-primary text-lg">
										{user?.firstName} {user?.lastName}
									</span>
								</div>
								<div className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
									<ChevronUp 
										size={18} 
										className="text-primary/60 group-hover:text-primary/80" 
									/>
								</div>
							</button>
							
							{/* Profile dropdown menu */}
							<div 
								className={`
									absolute bottom-full left-0 right-0 mb-2 bg-white rounded-theme-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out z-50
									${isProfileDropdownOpen 
										? 'opacity-100 visible translate-y-0' 
										: 'opacity-0 invisible translate-y-2'
									}
								`}
							>
								<div className="py-2">
									<button className="flex flex-row items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200">
										<Settings size={18} className="text-gray-600" />
										<span className="text-sm font-medium">Settings</span>
									</button>
									<button 
										onClick={() => router.visit('/')}
										className="flex flex-row items-center space-x-3 w-full px-4 py-3 text-green-600 hover:bg-green-50 transition-colors duration-200"
									>
										<ArrowLeft size={18} className="text-green-600" />
										<span className="text-sm font-medium">Return to Landing Page</span>
									</button>
									<button 
										onClick={handleLogout}
										className="flex flex-row items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
									>
										<LogOut size={18} className="text-red-600" />
										<span className="text-sm font-medium">Logout</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
