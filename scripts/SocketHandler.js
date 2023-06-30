import {  MountRequest, UnMountRequest } from "./MountingScript.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "MountRequest":
			console.log("Check4")
			MountRequest(pData);
			break;
		case "UnMountRequest":
			UnMountRequest(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.Rideable", organiseSocketEvents); });