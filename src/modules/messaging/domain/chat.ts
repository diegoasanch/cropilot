export type Chat = {
	id: number;
	userId: number;
};

export type Message = {
	id: number;
	isSystem: boolean;
	content: string;
	messageType: "text" | "image" | "location";
	createdAt: Date;
};
