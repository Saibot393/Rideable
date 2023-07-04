import { RideableUtils } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";
import { RideableCompUtil } from "./RideableCompUtil.js";

import { cStairwaysname, cTagger } from "./RideableCompUtil.js";

//RideableCompatability will take care of compatibility with other modules in regards to calls, currently supported:

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