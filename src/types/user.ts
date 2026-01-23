export interface UserInfoData {
    userId: number;
    type: UserType;
    username: string;
    accessKey: string;
    groupId: string;
    ports: number[];
    status: UserStatus;
    remark: string;
    uptime: number;
    addtime: number;
}

export enum UserType {
    User = 1,
    Admin = 2
}

export enum UserStatus {
    Open = 1,
    Closed = 2
}

export interface UserRequestData {
    userId?: number
    region: string
    username: string
    password: string
    accessKey: string
    secretKey: string
    groupId: string
    ports: number[] | string
    remark: string
}

export interface UserItemData {
    userId: number;
    type: number;
    username: string;
    accessKey: string;
    groupId: string;
    ports: number[];
    region: string;
    status: number;
    remark: string;
    uptime: number;
    addtime: number;
}