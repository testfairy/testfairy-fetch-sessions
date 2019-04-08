export interface SessionInterface {
	url: string;
	email: string;
}

export interface SessionsResponse {
	total_count: number;
	sessions: SessionInterface[];
}