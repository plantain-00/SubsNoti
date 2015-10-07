export interface ThemesResponse {
    themes: {
        id: number;
        title: string;
        detail: string;
        organizationId: number;
        createTime: number;
        creator: {
            id: number,
            name: string,
            email: string
        },
        owners: {
            id: number,
            name: string,
            email: string
        }[],
        watchers: {
            id: number,
            name: string,
            email: string
        }[]
    }[];
}