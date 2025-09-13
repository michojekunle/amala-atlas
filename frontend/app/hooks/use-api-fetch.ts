import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type FetchProperties = {
	url: string;
	queryKeys?: string[];
	queryParams?: Record<string, any>;
};
function useAPIFetch<RES>({
	url,
	queryKeys = [""],
	queryParams,
}: FetchProperties) {
	const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
	return useQuery<RES>({
		queryKey: [...queryKeys, url],
		queryFn: async () => {
			try {
				return axios
					.get<RES>(apiBaseUrl + url, {
						...queryParams,
					})
					.then((response) => {
						return response.data;
					})
					.then((data) => {
						return data as RES;
					});
			} catch (error) {
				console.error("Error fetching data:", error);
				throw error;
			}
		},
	});
}

export default useAPIFetch;
