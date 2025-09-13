"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

type ProviderProps = {
	children: React.ReactNode;
};

const Provider = ({ children }: ProviderProps) => {
	return (
		<QueryClientProvider client={new QueryClient()}>
			{children}
		</QueryClientProvider>
	);
};

export default Provider;
