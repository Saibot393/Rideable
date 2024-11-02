import { MountRequest, UnMountRequest } from "../MountingScript.js";
import { MoveRiddenRequest, SyncSortRequest } from "../RidingScript.js";
import { PopUpRequest } from "./RideablePopups.js";
import { RequestRideableTeleport } from "../compatibility/RideableCompatibility.js";
import { switchScene } from "../utils/RideableUtils.js";
import { RequestreplaceFollowerListIDs } from "../FollowingScript.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "MountRequest":
			MountRequest(pData);
			break;
		case "UnMountRequest":
			UnMountRequest(pData);
			break;
		case "PopUpRequest":
			PopUpRequest(pData);
			break;
		case  "RequestRideableTeleport":
			RequestRideableTeleport(pData);
			break;
		case "switchScene":
			switchScene(pData);
			break;
		case "MoveRiddenRequest":
			MoveRiddenRequest(pData);
			break;
		case "SyncSortRequest":
			SyncSortRequest(pData);
			break;
		case "RequestreplaceFollowerListIDs":
			RequestreplaceFollowerListIDs(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.Rideable", organiseSocketEvents); });