import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function getByThemeIds(themeIds: number[]): libs.Promise<interfaces.Watched[]> {
	return services.db.accessAsync("select theme_watchers.ThemeID,users.* from theme_watchers left join users on theme_watchers.WatcherID = users.ID where theme_watchers.ThemeID in (" + themeIds.join() + ")", []).then(rows=> {
		return libs.Promise.resolve(getFromRows(rows));
	});
}

export function canWatch(userId: number, themeId: number): libs.Promise<boolean> {
	return services.db.accessAsync("select OrganizationID from themes where ID = ?", [themeId]).then(rows=> {
		if (rows.length === 0) {
			return libs.Promise.resolve<boolean>(false);
		}

		let organizationId = rows[0].OrganizationID;
		return services.db.accessAsync("select * from organization_members where OrganizationID = ? and MemberID = ?", [organizationId, userId]).then(rows=> {
			return libs.Promise.resolve<boolean>(rows.length > 0);
		});
	});
}

function getFromRows(rows: any[]): interfaces.Watched[] {
	let result: interfaces.Watched[] = [];

	libs._.each(rows, row=> {
		let themeId = row.ThemeID;
		let watched = libs._.find(result, r=> {
			r.themeId === themeId;
		});

		if (!watched) {
			watched = {
				themeId: themeId,
				watchers: []
			};
			result.push(watched);
		}

		watched.watchers.push({
			id: row.ID,
			name: row.Name,
			email: `${row.EmailHead}@${row.EmailTail}`
		});
	});

	return result;
}