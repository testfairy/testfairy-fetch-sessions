export interface SessionInterface {
	url: string;
	email: string;
}

export interface SessionsResponse {
	total_count: number;
	sessions: SessionInterface[];
}

export interface DownloadedSessionScreenshot {
	id: number
	session: string,
	url: string,
	timestamp: number,
	filePath: string,
	imageIndex: number
	totalImages: number
}