import { MountRequest, UnMountRequest } from "./MountingScript.js";
import { PopUpRequest } from "./RideableUtils.js";

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
		console.log("Check1.2");
			PopUpRequest(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.Rideable", organiseSocketEvents); });