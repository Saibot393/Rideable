import { MountRequest, UnMountRequest } from "./MountingScript.js";
import { PopUpRequest } from "./RideablePopups.js";
import { RequestRideableTeleport } from "./RideableCompatibility.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	console.log(pFunction);
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
	}
}

Hooks.once("ready", () => { game.socket.on("module.Rideable", organiseSocketEvents); });