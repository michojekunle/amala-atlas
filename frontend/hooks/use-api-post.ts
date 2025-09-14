import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function postData<T>(
	url: string,
	queryKeys: (string | number)[] = [],
	data: T
) {
	const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
	const response = await axios.post<T>(`${apiBaseUrl}${url}`, data, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (response.status !== 201 && response.status !== 200) {
		throw new Error("Network response was not ok");
	}

	return response.data;
}

export default postData;
