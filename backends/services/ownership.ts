import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function getByThemeIds(themeIds: number[]): libs.Promise<interfaces.Ownership[]> {
	return services.db.accessAsync("select theme_owners.ThemeID,users.* from theme_owners left join users on theme_owners.OwnerID = users.ID where theme_owners.ThemeID in (" + themeIds.join() + ")", []).then(rows=> {
		return libs.Promise.resolve(getFromRows(rows));
	});
}

function getFromRows(rows: any[]): interfaces.Ownership[] {
	let result: interfaces.Ownership[] = [];

	libs._.each(rows, row=> {
		let themeId = row.ThemeID;
		let ownership = libs._.find(result, r=> {
			r.themeId === themeId;
		});

		if (!ownership) {
			ownership = {
				themeId: themeId,
				owners: []
			};
			result.push(ownership);
		}

		ownership.owners.push({
			id: row.ID,
			name: row.Name,
			email: `${row.EmailHead}@${row.EmailTail}`
		});
	});

	return result;
}