import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProContextType {
	isPro: boolean;
	togglePro: () => void;
	setPro: (value: boolean) => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

const PRO_STORAGE_KEY = "ivo_admin_pro_mode";

export function ProProvider({ children }: { children: React.ReactNode }) {
	const [isPro, setIsProState] = useState<boolean>(() => {
		if (typeof window === "undefined") return true;
		const stored = localStorage.getItem(PRO_STORAGE_KEY);
		return stored !== null ? stored === "true" : true;
	});

	useEffect(() => {
		try {
			const stored = localStorage.getItem(PRO_STORAGE_KEY);
			if (stored !== null) {
				setIsProState(stored === "true");
			}
		} catch {
			// fallback
		}
	}, []);

	const setPro = (value: boolean) => {
		setIsProState(value);
		if (typeof window !== "undefined") {
			localStorage.setItem(PRO_STORAGE_KEY, String(value));
		}
		if (value) {
			toast.success("Pro Mode Active (Admin Simulator)", {
				description:
					"All flows unlocked. 'My Flows' management and creation enabled.",
			});
		} else {
			toast.info("Free Mode Active (Admin Simulator)", {
				description: "Paywalls active. Testing restricted member experience.",
			});
		}
	};

	const togglePro = () => {
		setPro(!isPro);
	};

	return (
		<ProContext.Provider value={{ isPro, togglePro, setPro }}>
			{children}
		</ProContext.Provider>
	);
}

export function usePro(): ProContextType {
	const context = useContext(ProContext);
	if (!context) {
		return {
			isPro: true,
			togglePro: () => {},
			setPro: () => {},
		};
	}
	return context;
}
