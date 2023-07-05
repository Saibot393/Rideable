import { RideableUtils } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";

import { RideableCompUtils } from "./RideableCompUtils.js";
import { cStairways, cTagger, cWallHeight } from "./RideableCompUtils.js";

//RideableCompatability will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatability {
	//DECLARATIONS
	
	//specific: stairways
	static onStairwaysTeleport(pData) {} //called if stairways module is active and teleport is triggered
	
	//specific: wall-heights
	//IMPLEMENTATIONS
	//basic
	
	//specific
}

//Hook into other modules
Hooks.once("init", () => {
	if (RideableCompUtils.isactiveModule(cStairways)) {
		//Hooks.on("StairwayTeleport", (...args) => RideableCompatability.onStairwaysTeleport(...args));
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		console.log("jup");
	}
});