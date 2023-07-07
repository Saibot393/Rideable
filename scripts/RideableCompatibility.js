import { RideableUtils, cModuleName } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";

import { RideableCompUtils } from "./RideableCompUtils.js";
import { cStairways, cTagger, cWallHeight } from "./RideableCompUtils.js";
//			SW			TGG		WH

//RideableCompatability will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatability {
	//DECLARATIONS
	
	//specific: stairways
	static async onSWTeleport(pData) {} //called if stairways module is active and teleport is triggered
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {} //teleports all Tokens in pTokenIDs that have not yet been teleported
	
	//specific: wall-heights
	static onWHTokenupdate(pDocument, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	//IMPLEMENTATIONS
	
	//specific: stairways
	static async onSWTeleport(pData) {
		if (pData.sourceSceneId != pData.targetSceneId) {
			//only necessary for cross scene teleport
			
			let vTokenIDs = pData.selectedTokenIds;
			let vTarget = pData.targetData;
			
			let vSourceScene = game.scenes.get(pData.sourceSceneId);
			let vTargetScene = game.scenes.get(pData.targetSceneId);
			
			if (vSourceScene && vTargetScene) {
				for (let i = 0; i < vTokenIDs.length; i++) {
					let vToken = RideableCompUtils.TokenwithpreviousID(vTokenIDs[i]);
					
					if (vToken) {
						if (RideableFlags.isRidden(vToken)) {
							//teleport
							await RideableCompatability.SWTeleportleftTokens(RideableFlags.RiderTokenIDs(vToken), vSourceScene, vTargetScene, vTarget);
							//update flags
							await RideableCompUtils.UpdateRiderIDs(vToken);
							
							RideableCompUtils.UpdatePreviousID(vToken);
							//order riders
							let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(vToken));
					
							UpdateRidderTokens(vToken, vRiderTokenList, false, false);
						}
					}
				}
			}
		}
	}
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) { 
		//adapted from staiways(by SWW13)>teleport.js>handleTeleportRequestGM:
		if (pSourceScene && pTargetScene) {
			// get selected tokens data
			const selectedTokensData = foundry.utils.duplicate(pSourceScene.tokens.filter((vToken) => pTokenIDs.includes(vToken.id)))

			// set new token positions
			for (let vToken of selectedTokensData) {
				vToken.x = Math.round(pSWTarget.x - vToken.width * pTargetScene.grid.size / 2);
				vToken.y = Math.round(pSWTarget.y - vToken.height * pTargetScene.grid.size / 2);
			}

			// remove selected tokens from current scene (keep remaining tokens)
			await pSourceScene.deleteEmbeddedDocuments(Token.embeddedName, pTokenIDs, { isUndo: true });

			// add selected tokens to target scene
			await pTargetScene.createEmbeddedDocuments(Token.embeddedName, selectedTokensData, { isUndo: true });
		}
	} 
	
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
		Hooks.on("StairwayTeleport", (...args) => RideableCompatability.onSWTeleport(...args));
		
		Hooks.on(cModuleName + "." + "Mount", (pRider, pRidden) => {
																	RideableCompUtils.UpdatePreviousID(pRider)
																	RideableCompUtils.UpdatePreviousID(pRidden)
																	}); //so after Teleport Token can still be found through the old id
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		Hooks.on("updateToken", (...args) => RideableCompatability.onWHTokenupdate(...args));
	}
});