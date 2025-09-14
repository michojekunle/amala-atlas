import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Post data to an API endpoint with enhanced error handling and flexibility.
 *
 * @template T - Request body type
 * @template R - Response data type
 * @param {string} url - The endpoint path (relative to API base URL)
 * @param {T} data - The request payload
 * @param {AxiosRequestConfig} [config] - Optional Axios config (headers, onUploadProgress, etc)
 * @returns {Promise<R>} - The response data
 * @throws {Error} - Throws with error message if request fails
 */
async function postData<T, R = any>(
	url: string,
	data: T,
	config?: AxiosRequestConfig
): Promise<R> {
	const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
	try {
		const response: AxiosResponse<R> = await axios.post(
			`${apiBaseUrl}${url}`,
			data,
			{
				headers: {
					"Content-Type": "application/json",
					...(config?.headers || {}),
				},
				...config,
			}
		);
		return response.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(
				error.response.data?.message ||
					error.response.data?.detail ||
					`Request failed with status ${error.response.status}`
			);
		} else if (error.request) {
			throw new Error("No response from server. Please check your network.");
		} else {
			throw new Error(error.message || "Unknown error occurred");
		}
	}
}

export default postData;
