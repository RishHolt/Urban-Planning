import React, { useEffect, useState } from "react";
import { Menu, Moon, Sun, Bell } from "lucide-react"
import { Link, usePage } from "@inertiajs/react";
import { useAppearance } from "../hooks/use-appearance";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Topnav = ({ onToggleSidebar }: HeaderProps) => {
	const [date, setDate] = useState(new Date());
	const { url } = usePage();
	const pathnames = url.split("/").filter(x => x);
	const { appearance, updateAppearance } = useAppearance();

	useEffect(() => {
		const timer = setInterval(() => {
			setDate(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formattedDate = date.toLocaleDateString(undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});
	const formattedTime = date.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});

	const toggleTheme = () => {
		const newMode = appearance === 'light' ? 'dark' : 'light';
		console.log('Toggling theme from', appearance, 'to', newMode);
		updateAppearance(newMode);
	};

	const ThemeIcon = appearance === 'dark' ? Moon : Sun;

	return (
		<>
			<div className="flex flex-row items-center space-x-6 bg-surface px-6 border-accent border-b-2 w-full min-h-18 shadow-theme-sm">
				<button 
					onClick={() => {
						console.log('Button clicked in Topnav');
						onToggleSidebar();
					}} 
					className="group hover:bg-secondary hover:shadow-theme-md p-2 rounded-theme-md transition-all duration-200 cursor-pointer"
					aria-label="Toggle sidebar"
				>
					<Menu className="text-secondary group-hover:text-surface" />
				</button>
				<div className="flex flex-col">
					<h1 className="font-bold text-primary text-lg">Urban Planning, Zoning & Housing</h1>
					<nav aria-label="Breadcrumb" className="text-secondary text-sm">
						<ol className="flex items-center space-x-1">
							<Link href="/dashboard" className="hover:underline">Home</Link>
							{pathnames.map((name, idx) => {
								const routeTo = "/" + pathnames.slice(0, idx + 1).join("/");
								return (
									<span key={routeTo} className="flex items-center">
										<span className="mx-1">/</span>
										{idx === pathnames.length - 1 ? (
											<span className="font-semibold">{decodeURIComponent(name.replace(/-/g, " "))}</span>
										) : (
											<Link href={routeTo} className="hover:underline">{decodeURIComponent(name.replace(/-/g, " "))}</Link>
										)}
									</span>
								);
							})}
						</ol>
					</nav>
				</div>
				<div className="flex flex-1 justify-end items-center space-x-4">
					<div className="flex flex-row space-x-2 font-bold text-secondary">
						<span className="text-sm">{formattedDate}</span>
						<span className="text-sm">{formattedTime}</span>
					</div>
					<div className="bg-secondary/25 hover:bg-secondary hover:shadow-theme-md p-2 rounded-theme-md transition-all duration-200 cursor-pointer group">
						<Bell className="text-secondary group-hover:text-surface" />
					</div>
					<button
						onClick={toggleTheme}
						className="bg-secondary/25 hover:bg-secondary hover:shadow-theme-md p-2 rounded-theme-md transition-all duration-200 cursor-pointer group"
						aria-label={`Switch theme (current: ${appearance})`}
					>
						<ThemeIcon className="text-secondary group-hover:text-surface" />
					</button>
				</div>
			</div>
		</>
	);
}

export default Topnav;
