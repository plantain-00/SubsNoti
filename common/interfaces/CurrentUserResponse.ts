export interface CurrentUserResponse {
    id: number;
    email: string;
    name: string;
    canCreateOrganization: boolean;
}