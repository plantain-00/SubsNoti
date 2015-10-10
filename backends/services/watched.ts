'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

interface Watched {
	themeId: number,
	watchers: {
		id: number,
		name: string,
		email: string
	}[]
}

export async function getByThemeIds(themeIds: number[]): Promise<Watched[]> {
	if (themeIds.length === 0) {
		return Promise.resolve([]);
	}

	let rows = await services.db.queryAsync("select theme_watchers.ThemeID,users.* from theme_watchers left join users on theme_watchers.WatcherID = users.ID where theme_watchers.ThemeID in (" + themeIds.join() + ")", []);
	return Promise.resolve(getFromRows(rows));
}

export async function canWatch(userId: number, themeId: number): Promise<boolean> {
	let rows = await services.db.queryAsync("select OrganizationID from themes where ID = ?", [themeId]);
	if (rows.length === 0) {
		return Promise.resolve<boolean>(false);
	}

	let organizationId = rows[0].OrganizationID;
	rows = await services.db.queryAsync("select * from organization_members where OrganizationID = ? and MemberID = ?", [organizationId, userId]);
	return Promise.resolve<boolean>(rows.length > 0);
}

function getFromRows(rows: any[]): Watched[] {
	let result: Watched[] = [];

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
