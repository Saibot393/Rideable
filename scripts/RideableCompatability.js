import { RideableUtils } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";

import { cStairwaysname } from "./RideableUtils.js";

//RideableCompatability will take care of compatibility with other modules, currently explicitly supported:
//-staiways (only inside the same scene
class RideableCompatability {
	//DECLARATIONS
	static onStairwaysTeleport(pData) {} //called if stairways module is active and teleport is triggered
	
	//IMPLEMENTATIONS
	static onStairwaysTeleport(pData) {
	}
}

//Hook into other modules
Hooks.once("ready", () => {
	if (RideableUtils.isactiveModule(cStairwaysname)) {
		//Hooks.on("StairwayTeleport", (...args) => RideableCompatability.onStairwaysTeleport(...args));
	}
});