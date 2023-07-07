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
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID) {} //called if Rideable Teleports Tokens
	
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {} //Organises the teleport of all Riders of pTokenID
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {} //teleports all Tokens in pTokenIDs that have not yet been teleported
	
	//specific: wall-heights
	static onWHTokenupdate(pDocument, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	//IMPLEMENTATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {
		if (game.user.isGM) {
			RideableCompatibility.RequestRideableTeleport(pData.selectedTokenIds, pData.sourceSceneId, pData.targetSceneId, pData.targetData._id);
		}
		else {
			game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : pData.selectedTokenIds, pSourceSceneID : pData.sourceSceneId, pTargetSceneID : pData.targetSceneId, pSWTargetID : pData.targetData._id}});
		}
	}
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID) {
		if (game.user.isGM) {
			console.log("Check0.1");
			if (pSourceSceneID != pTargetSceneID) {
				console.log("Check0.2");
				//only necessary for cross scene teleport
				
				let vSourceScene = game.scenes.get(pSourceSceneID);
				let vTargetScene = game.scenes.get(pTargetSceneID);
				
				let vTarget = vTargetScene.stairways.get(pSWTargetID);	
				
				console.log("Check0.3");
				RideableCompatibility.OrganiseTeleport(pTokenIDs, vSourceScene, vTargetScene, vTarget);
			}
		}
	} 	
		
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget) {
		if (game.user.isGM) {
			console.log("check1");
			if (pSourceScene != pTargetScene) {
				console.log("check2");
				if (pSourceScene && pTargetScene) {
					console.log("check3");
					for (let i = 0; i < pTokenIDs.length; i++) {
						console.log("check4");
						let vToken = RideableCompUtils.TokenwithpreviousID(pTokenIDs[i], pTargetScene);
						
						console.log(vToken);
						if (vToken) {
							console.log("check5");
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
			//filter pTokenIDs
			let vValidTokenIDs = await pTokenIDs.filter(vID => pSourceScene.tokens.get(vID));
			
			// get selected tokens data
			if (vValidTokenIDs.length) {
				const selectedTokensData = foundry.utils.duplicate(pSourceScene.tokens.filter((vToken) => vValidTokenIDs.includes(vToken.id)))

				// set new token positions
				for (let vToken of selectedTokensData) {
					vToken.x = Math.round(pSWTarget.x - vToken.width * pTargetScene.grid.size / 2);
					vToken.y = Math.round(pSWTarget.y - vToken.height * pTargetScene.grid.size / 2);
				}


				// remove selected tokens from current scene (keep remaining tokens)
				await pSourceScene.deleteEmbeddedDocuments(Token.embeddedName, vValidTokenIDs, { isUndo: true });
				// add selected tokens to target scene
				await pTargetScene.createEmbeddedDocuments(Token.embeddedName, selectedTokensData, { isUndo: true });
			}
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


//exports
function RequestRideableTeleport({ pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID } = {}) { return RideableCompatibility.RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID); }

export { RequestRideableTeleport };

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