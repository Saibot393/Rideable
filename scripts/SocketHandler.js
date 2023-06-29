import {  MountRequest, UnMountRequest } from "./MountingScript.js";

//execute functions with pData depending on pFunction
function async organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "MountRequest":
			await MountRequest(pData);
			break;
		case "UnMountRequest":
			UnMountRequest(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.Rideable", organiseSocketEvents); });