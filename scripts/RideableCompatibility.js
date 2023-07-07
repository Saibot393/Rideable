import { RideableUtils, cModuleName } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";

import { RideableCompUtils } from "./RideableCompUtils.js";
import { cStairways, cTagger, cWallHeight } from "./RideableCompUtils.js";
//			SW			TGG		WH

//RideableCompatibility will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatibility {
	//DECLARATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {} //called if stairways module is active and teleport is triggered
	
	static onRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID) {} //called if Rideable Teleports Tokens
	
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {} //Organises the teleport of all Riders of pTokenID
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {} //teleports all Tokens in pTokenIDs that have not yet been teleported
	
	//specific: wall-heights
	static onWHTokenupdate(pDocument, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	//IMPLEMENTATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {
		if (game.user.isGM) {
			RideableCompatibility.onRideableTeleport(pData.selectedTokenIds, pData.sourceSceneId, pData.targetSceneId, pData.targetData._id);
		}
		else {
			game.socket.emit("module.Rideable", {pFunction : "onRideableTeleport", pData : {pTokenIDs :  pData.selectedTokenIds, pSourceScene : game.scenes.get(pData.sourceSceneId), pTargetScene : vTargetScene = game.scenes.get(pData.targetSceneId), pSWTarget : pData.targetData}});
		}
	}
	
	static onRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID) {
		if (game.user.isGM) {
			if (pSourceSceneID != pTargetSceneID) {
				//only necessary for cross scene teleport
				
				let vSourceScene = game.scenes.get(pSourceSceneID);
				let vTargetScene = game.scenes.get(pTargetSceneID);
				
				let vTarget = vTargetScene.stairways.get(pSWTargetID);	
				
				RideableCompatibility.OrganiseTeleport(pTokenIDs, vSourceScene, vTargetScene, vTarget);
			}
		}
	} 	
		
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {
		if (game.user.isGM) {
			if (pSourceScene != pTargetScene) {
				if (pSourceScene && pTargetScene) {
					for (let i = 0; i < pTokenIDs.length; i++) {
						let vToken = RideableCompUtils.TokenwithpreviousID(pTokenIDs[i]);
						if (vToken) {
							if (RideableFlags.isRidden(vToken)) {
								//teleport
								await RideableCompatibility.SWTeleportleftTokens(RideableFlags.RiderTokenIDs(vToken), pSourceScene, pTargetScene, pSWTarget);
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
		
		//RideableCompatibility.OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget);
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

export { RideableCompatibility };

//Hook into other modules
Hooks.once("init", () => {
	if (RideableCompUtils.isactiveModule(cStairways)) {
		Hooks.on("StairwayTeleport", (...args) => RideableCompatibility.onSWTeleport(...args));
		
		Hooks.on(cModuleName + "." + "Teleport", (...args) => RideableCompatibility.onRideableTeleport(...args))
		
		Hooks.on(cModuleName + "." + "Mount", (pRider, pRidden) => {
																	RideableCompUtils.UpdatePreviousID(pRider)
																	RideableCompUtils.UpdatePreviousID(pRidden)
																	}); //so after Teleport Token can still be found through the old id
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		Hooks.on("updateToken", (...args) => RideableCompatibility.onWHTokenupdate(...args));
	}
});