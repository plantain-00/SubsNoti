export interface Ownership {
	themeId: number,
	owners: {
		id: number,
		name: string,
		email: string
	}[]
}