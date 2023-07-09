import { RideableUtils, cModuleName } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { UpdateRidderTokens } from "./RidingScript.js";
import { RideablePopups } from "./RideablePopups.js";

import { RideableCompUtils } from "./RideableCompUtils.js";
import { cStairways, cTagger, cWallHeight } from "./RideableCompUtils.js";
//			SW			TGG		WH

//RideableCompatibility will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatibility {
	//DECLARATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {} //called if stairways module is active and teleport is triggered

	static onSWPreTeleport(pData) {} //called if stairways module is active and pre teleport is triggered
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID, pUserID) {} //called if Rideable Teleports Tokens
	
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget, pUser) {} //Organises the teleport of all Riders of pTokenID
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget, pUser) {} //teleports all Tokens in pTokenIDs that have not yet been teleported
	
	//specific: wall-heights
	static onWHTokenupdate(pToken, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	//IMPLEMENTATIONS
	
	//specific: stairways
	static onSWTeleport(pData) {
		//game.socket.emit("module.Rideable", {pFunction : "switchScene", pData : {pUserID : "T0isEfpkKbyG4zis", pSceneID : "6ploh8zOxN1blPVO", px : 0; py : 0}});
		if (game.user.isGM) {
			RideableCompatibility.RequestRideableTeleport(pData.selectedTokenIds, pData.sourceSceneId, pData.targetSceneId, pData.targetData._id, game.user.id);
		}
		else {
			game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : pData.selectedTokenIds, pSourceSceneID : pData.sourceSceneId, pTargetSceneID : pData.targetSceneId, pSWTargetID : pData.targetData._id, pUserID : pData.userId}});
		}
	}
	
	static onSWPreTeleport(pData) {
		if (!game.user.isGM) {
			if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow") {
				//stop riders from moving through stairways
				let vInvalidTokens = [];
				
				for (let i = 0; i < pData.selectedTokenIds.length; i++) {
					
					if (RideableFlags.isRider(RideableUtils.TokenfromID(pData.selectedTokenIds[i]))) {
						vInvalidTokens[vInvalidTokens.length] = pData.selectedTokenIds[i];
						
						let vToken = RideableUtils.TokenfromID(pData.selectedTokenIds[i]);
						RideablePopups.TextPopUpID(vToken ,"PreventedRiderMove", {pRiddenName : vToken.name}); //MESSAGE POPUP
					}
				}
				
				pData.selectedTokenIds = pData.selectedTokenIds.filter(vID => !vInvalidTokens.includes(vID));
				
				if (!pData.selectedTokenIds.length) {
					//stop scene change if all tokens are invalid
					pData.userId = "";
				}
			}
		}
	}
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID, pUserID) {
		if (game.user.isGM) {
			if ((pSourceSceneID != pTargetSceneID) && pSourceSceneID && pTargetSceneID) {
				//only necessary for cross scene teleport
				
				let vSourceScene = game.scenes.get(pSourceSceneID);
				let vTargetScene = game.scenes.get(pTargetSceneID);
				
				let vTarget = vTargetScene.stairways.get(pSWTargetID);	
				
				RideableCompatibility.OrganiseTeleport(pTokenIDs, vSourceScene, vTargetScene, vTarget, game.users.get(pUserID));
			}
		}
	} 	
		
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget, pUser) {
		//canvas.tokens.placeables.filter(vToken => vToken.name == "Gegner")[0].actor.ownership["OpgCvzuz9GygT72J"]
		if (game.user.isGM) {
			if (pSourceScene != pTargetScene) {
				if (pSourceScene && pTargetScene) {
					for (let i = 0; i < pTokenIDs.length; i++) {
						let vToken = RideableCompUtils.TokenwithpreviousID(pTokenIDs[i], pTargetScene);
						
						if (vToken) {
							if (RideableFlags.isRider(vToken)) {
								//see if ridden token was left behind
								let vRiddenToken = pSourceScene.tokens.find(vpreviousToken => RideableFlags.isRiddenbyID(vpreviousToken, RideableCompUtils.PreviousID(vToken)));
								
								if (vRiddenToken && (vRiddenToken.actor.ownership[pUser.id] >= 3)) {
									//only teleport if ridden token is owned
									await RideableCompatibility.SWTeleportleftTokens([vRiddenToken.id], pSourceScene, pTargetScene, pSWTarget, pUser);
								}
							}
							
							if (RideableFlags.isRidden(vToken)) {
								//teleport riders
								await RideableCompatibility.SWTeleportleftTokens(RideableFlags.RiderTokenIDs(vToken), pSourceScene, pTargetScene, pSWTarget, pUser);
								
								//update ridden by id flags
								await RideableCompUtils.UpdateRiderIDs(vToken);
								
								RideableCompUtils.UpdatePreviousID(vToken);
								
								//order riders
								let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(vToken), vToken.scene);
						
								UpdateRidderTokens(vToken, vRiderTokenList, false, false);
							}
						}
					}
				}
			}
		}
	}
	
	static async SWTeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pSWTarget, pUser) {
		//adapted from staiways(by SWW13)>teleport.js>handleTeleportRequestGM:
		if (pSourceScene && pTargetScene) {
			//filter pTokenIDs
			let vValidTokenIDs = await pTokenIDs.filter(vID => pSourceScene.tokens.get(vID));
			
			// get selected tokens data
			if (vValidTokenIDs.length) {
				let vselectedTokensData = foundry.utils.duplicate(pSourceScene.tokens.filter((vToken) => vValidTokenIDs.includes(vToken.id)))

				// set new token positions
				for (let vToken of vselectedTokensData) {
					vToken.x = Math.round(pSWTarget.x - vToken.width * pTargetScene.grid.size / 2);
					vToken.y = Math.round(pSWTarget.y - vToken.height * pTargetScene.grid.size / 2);
				}					

				// remove selected tokens from current scene (keep remaining tokens)
				await pSourceScene.deleteEmbeddedDocuments(Token.embeddedName, vValidTokenIDs, { isUndo: true });
				// add selected tokens to target scene
				await pTargetScene.createEmbeddedDocuments(Token.embeddedName, vselectedTokensData, { isUndo: true });
				
				
				for (let i = 0; i < vselectedTokensData.length; i++) {
					//if a standard token gets teleported, let respective owener see the new scene		
					let vUsers = RideableUtils.UserofCharacterID(vselectedTokensData[i].actorId);
					
					for (let j = 0; j < vUsers.length; j++) {
						game.socket.emit("module.Rideable", {pFunction : "switchScene", pData : {pUserID : vUsers[j].id, pSceneID : pTargetScene.id, px : pSWTarget.x, py : pSWTarget.y}});
					}
				}		
				
				game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : vValidTokenIDs, pSourceSceneID : pSourceScene.id, pTargetSceneID : pTargetScene.id, pSWTargetID : pSWTarget._id, pUserID : pUser.id}});
			}
		}
		
		RideableCompatibility.OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pSWTarget, pUser);
	} 
	
	//specific: wall-heights	
	static onWHTokenupdate(pToken, pchanges, pInfos) {
		if (game.user.isGM) {			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(pToken)) {
				
				//check if token position was actually changed
				if (pchanges.flags && pchanges.flags[cWallHeight]) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), pToken.scene);
					
					UpdateRidderTokens(pToken, vRiderTokenList, false, pInfos.animate);
				}
			}
		}
	}
	
}


//exports
function RequestRideableTeleport({ pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID, pUserID } = {}) { return RideableCompatibility.RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pSWTargetID, pUserID); }

export { RequestRideableTeleport };

//Hook into other modules
Hooks.once("init", () => {
	
	if (RideableCompUtils.isactiveModule(cStairways)) {
		Hooks.on("StairwayTeleport", (...args) => RideableCompatibility.onSWTeleport(...args));
		
		Hooks.on("PreStairwayTeleport", (...args) => RideableCompatibility.onSWPreTeleport(...args));
		
		Hooks.on(cModuleName + "." + "Teleport", (...args) => RideableCompatibility.RequestRideableTeleport(...args))
		
		Hooks.on(cModuleName + "." + "Mount", (pRider, pRidden) => {
																	RideableCompUtils.UpdatePreviousID(pRider)
																	RideableCompUtils.UpdatePreviousID(pRidden)
																	}); //so after Teleport Token can still be found through the old id
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		Hooks.on("updateToken", (...args) => RideableCompatibility.onWHTokenupdate(...args));
	}
});