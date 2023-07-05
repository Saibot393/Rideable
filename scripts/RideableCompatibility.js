import { RideableUtils } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";

import { RideableCompUtils } from "./RideableCompUtils.js";
import { cStairways, cTagger, cWallHeight } from "./RideableCompUtils.js";
//			SW			TGG		WH

//RideableCompatability will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatability {
	//DECLARATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {} //called if stairways module is active and teleport is triggered
	
	//specific: wall-heights
	static onWHTokenupdate(pDocument, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	//IMPLEMENTATIONS
	
	//specific: wall-heights
	
	static onWHTokenupdate(pDocument, pchanges, pInfos) {
		if (game.user.isGM) {
			let vToken = pDocument.object;
			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(vToken)) {
				
				//check if token position was actually changed
				if (pchanges.flags && pchanges.flags[cWallHeight]) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(vToken));
					
					UpdateRidderTokens(vToken, vRiderTokenList, false, pInfos.animate);
				}
			}
		}
	}
	
}

//Hook into other modules
Hooks.once("init", () => {
	if (RideableCompUtils.isactiveModule(cStairways)) {
		//Hooks.on("StairwayTeleport", (...args) => RideableCompatability.onStairwaysTeleport(...args));
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		Hooks.on("updateToken", (...args) => RideableCompatability.onWHTokenupdate(...args));
	}
});