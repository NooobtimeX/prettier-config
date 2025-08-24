import {
	PrettierOptionTypeEnum,
	PrettierOptionValidateEnum,
} from "@/enum/prettierOption";

export type PrettierOptionType = {
	name: string;
	key: string;
	description: string;
	type: PrettierOptionTypeEnum;
	options?: (string | boolean)[];
	validate: PrettierOptionValidateEnum;
	since?: string;
};
