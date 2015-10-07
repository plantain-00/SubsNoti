export interface Watched {
	themeId: number,
	watchers: {
		id: number,
		name: string,
		email: string
	}[]
}