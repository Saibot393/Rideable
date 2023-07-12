import * as FCore from "./CoreVersionComp.js";

import { RideableFlags } from "./helpers/RideableFlags.js";
import { EffectManager } from "./helpers/EffectManager.js";
import { GeometricUtils } from "./utils/GeometricUtils.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";
import { UpdateRidderTokens, UnsetRidingHeight } from "./RidingScript.js";

//can be called by macros to quickly control the Riding functionality and handels a few additional settings regarding mounting
class MountingManager {
	//DECLARATIONS
	//Basic Mounting /UnMounting
	static MountSelectedGM(pTarget, pselectedTokens, pFamiliar = false) {} //starts riding flag distribution, marking pselectedTokens as riding pTarget
	
	static async MountSelected(pTargetHovered = false, pFamiliar = false) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pFamiliar = false) {} //Request GM user to execute MountSelectedGM with given parameters
	
	static UnMountSelectedGM(pselectedTokens, pRemoveRiddenreference = true) {} //remove all riding flags concerning pselectedTokens
	
	static UnMountSelected() {} //works out what tokens should be unmounted and calls request unmount on them
	
	static RequestUnmount(pTokens) {} //exceutes a UnMountSelectedGM request socket for players or UnMountSelectedGM directly for GMs

	static UnMountRequest( pselectedTokenID , pSceneID) {} //Request GM user to execute UnMountSelectedGM with given parameters
	
	static UnMountRiders(pRiddenToken, pRiders) {} //Unmounts all Tokens in pRiders that currently Ride pRiddenToken
	
	static UnMountallRiders(pRiddenToken) {} //Unmounts all Tokens that currently Ride pRiddenToken
	
	//Additional functions
	static onIndependentRiderMovement(pToken) {} //everything that happens upon a rider moving (besides the basics)
	
	static onMount(pRider, pRidden, pFamiliar = false) {} //everything that happens upon a token mounting (besides the basics)
	
	static onUnMount(pRider, pRidden, pFamiliar = false) {} //everything that happens upon a token unmounting (besides the basics)
	
	//Aditional Informations
	static TokencanMount (pRider, pRidden, pFamiliar = false, pShowPopups = false) {} //returns if pRider can currently mount pRidden (ignores TokenisRideable and TokencanRide) (can also show appropiate popups with reasons why mounting failed)
	
	//Handel Token Creation/Deletion
	static async onTokenCreation(pTokenDocument, pInfos, pID) {} //Span on spawn tokens or mount if on spawn is active
	
	static onTokenDeletion(pToken) {} //Removes pToken from the Rider logic (both in Regards to Ridden and Riders)
	
	//IMPLEMENTATION
	//Basic Mounting /UnMounting
	static MountSelectedGM(pTarget, pselectedTokens, pFamiliar = false, pScene = null) {
		//only works directly for GMs
		if (game.user.isGM) {		
			//make sure ptarget exists	
			if ((!pFamiliar) || (game.settings.get(cModuleName, "FamiliarRiding"))) {
				//pFamiliar riding can only be handled if setting is activated
				if (pTarget) {
					if (RideableFlags.TokenisRideable(pTarget) || pFamiliar) {
						
						let vValidTokens = pselectedTokens.filter(vToken => !RideableFlags.isRider(vToken) && (vToken != pTarget)).slice(0, RideableFlags.TokenRidingSpaceleft(pTarget, pFamiliar));
						
						if (vValidTokens.length) {
							let vpreviousRiders = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pTarget), FCore.sceneof(pTarget));
							
							if (pFamiliar) {
								//if a familiar was added only the familiars positions have to be updated
								vpreviousRiders = vpreviousRiders.filter(vToken => RideableFlags.isFamiliarRider(vToken));
							}
							
							RideableFlags.addRiderTokens(pTarget, vValidTokens, pFamiliar);
							
							UpdateRidderTokens(pTarget, vValidTokens.concat(vpreviousRiders), pFamiliar);
							
							for (let i = 0; i < vValidTokens.length; i++) {
								MountingManager.onMount(vValidTokens[i], pTarget, pFamiliar);
							}
						}
					}
				}
			}
		}
		
		return;
	}
	
	static async MountSelected(pTargetHovered = false, pFamiliar = false) {
		let vTarget = RideableUtils.targetedToken();
		
		if (pTargetHovered || !vTarget) {
			vTarget = RideableUtils.hoveredToken();
			
			if (!vTarget) {
				vTarget = RideableUtils.targetedToken();
			}
		}
		
		//Make sure all riders can even ride the target
		await RideableFlags.recheckRiders(vTarget);
		
		let vValidRiders = RideableUtils.selectedTokens().filter(vToken => MountingManager.TokencanMount(vToken, vTarget, pFamiliar, true));
		
		if (pFamiliar) {
			//pFamiliar make sure selected are actually familairs of target
			vValidRiders = vValidRiders.filter(vToken => RideableUtils.TokenisFamiliarof(vToken, vTarget));
		}
		
		//fork dependent on GM status of user (either direct mount or mount request through Token ID send via socket)
		if (game.user.isGM) {
			MountingManager.MountSelectedGM(vTarget, vValidRiders, pFamiliar);
		}
		else {
			if (!game.paused) {
				//call Hook so GM can give Riding effects
				if ((vTarget) && (vValidRiders.length > 0)) {
					let vcurrentTargetID = vTarget.id;
					
					let vselectedTokenIDs = RideableUtils.IDsfromTokens(vValidRiders);
					
					game.socket.emit("module.Rideable", {pFunction : "MountRequest", pData : {pTargetID: vcurrentTargetID, pselectedTokensID: vselectedTokenIDs, pSceneID : FCore.sceneof(vTarget).id, pFamiliar : pFamiliar}});
				}
			}
		}
		
		return;
	}
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pFamiliar = false) { 
		//Handels Mount request by matching TokenIDs to Tokens and mounting them
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			
			MountingManager.MountSelectedGM(RideableUtils.TokenfromID(pTargetID, vScene), RideableUtils.TokensfromIDs(pselectedTokensID, vScene), pFamiliar);
		}
		
		return;
	}
	
	static UnMountSelectedGM(pselectedTokens, pRemoveRiddenreference = true) {
		//verify pselectedToken exists
		if (pselectedTokens) {
			let vRiderTokens = pselectedTokens.filter(vToken => RideableFlags.isRider(vToken));//.filter(vToken => RideableFlags.isRider(vToken));
			let vRiddenTokens = [];
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				vRiddenTokens[i] = RideableFlags.RiddenToken(vRiderTokens[i]);
			}
				
			RideableFlags.stopRiding(vRiderTokens, pRemoveRiddenreference);
			
			UnsetRidingHeight(vRiderTokens, vRiddenTokens);
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				let vRiddenToken = RideableFlags.RiddenToken(vRiderTokens[i]);
				
				MountingManager.onUnMount(vRiderTokens[i], vRiddenTokens[i]);
			}
		}
	}
	
	
	static UnMountSelected() {
		//fork dependent on GM status of user (either direct unmount or unmount request through Token ID send via socket)
		if (RideableUtils.selectedTokens().length > 0) {
			let vUnMountTokens = RideableUtils.selectedTokens();
			
			let vTarget = RideableUtils.targetedToken();
			
			
			//to allow mounts to unmount targeted rider
			if (vTarget) {
				if (RideableFlags.isRiddenby(RideableUtils.selectedTokens()[0], vTarget)) {
					vUnMountTokens = [vTarget];
				}
			}
			
			MountingManager.RequestUnmount(vUnMountTokens);
		}
	}
	
	static RequestUnmount(pTokens) {
		if (game.user.isGM) {
			MountingManager.UnMountSelectedGM(pTokens);
		}
		else {
			if (!game.paused && pTokens.length) {
				let vUnMountTokensIDs = RideableUtils.IDsfromTokens(pTokens);
				
				game.socket.emit("module.Rideable", {pFunction : "UnMountRequest", pData : {pselectedTokenIDs: vUnMountTokensIDs, pSceneID : FCore.sceneof(pTokens[0]).id}});
			}
		}
	} 
	
	static UnMountRequest( pselectedTokenIDs, pSceneID ) { 
		//Handels UnMount request by matching TokenIDs to Tokens and unmounting them
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(pselectedTokenIDs, vScene));
		}
	}
	
	static UnMountRiders(pRiddenToken, pRiders) {
		if ((pRiddenToken) && (pRiders)) {
			MountingManager.UnMountSelectedGM(pRiders.filter(vToken => RideableFlags.isRiddenby(pRiddenToken, vToken)));
		}
	} 
	
	static UnMountallRiders(pRiddenToken) {
		if (pRiddenToken) {
			MountingManager.UnMountRiders(RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pRiddenToken), FCore.sceneof(pRiddenToken)));
		}
	} 
	
	//Additional functions
	
	static onIndependentRiderMovement(pToken, pChanges) {
		if (RideableFlags.isRider(pToken)) {
			if (game.settings.get(cModuleName, "RiderMovement") == "RiderMovement-dismount") {
				if (pChanges.hasOwnProperty("x") || pChanges.hasOwnProperty("y") || pChanges.hasOwnProperty("elevation")) {
					MountingManager.RequestUnmount([pToken]);
				}
			}
		}
	}
	
	static onMount(pRider, pRidden, pFamiliar = false) {
		if (!pFamiliar) {
			
			if (pRidden) {
				if (pFamiliar) {
					RideablePopups.TextPopUpID(pRider ,"MountingFamiliar", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
				else {
					RideablePopups.TextPopUpID(pRider ,"Mounting", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
			}
			
			//Aplly mounted effect if turned on
			if (game.settings.get(cModuleName, "RidingSystemEffects")) {
				if (EffectManager.getSystemMountingEffect()) {
					pRider.actor.createEmbeddedDocuments("Item", [EffectManager.getSystemMountingEffect()]);
				}
			}
		}
		else {
			
		}	
		
		Hooks.callAll(cModuleName + "." + "Mount", pRider, pRidden, pFamiliar);
	} 
	
	static async onUnMount(pRider, pRidden, pFamiliar = false) {
		if (pRider) {
			
			if (pRidden) {
				if (pFamiliar) {
					RideablePopups.TextPopUpID(pRider ,"UnMountingFamiliar", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
				else {
					RideablePopups.TextPopUpID(pRider ,"UnMounting", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
			}
			
			if (game.settings.get(cModuleName, "RidingSystemEffects")) {
				if (EffectManager.getSystemMountingEffect()) {
					await pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.filter(vElement => vElement.sourceId == EffectManager.getSystemMountingEffect().flags.core.sourceId).map(vElement => vElement.id));
				}
			}
		}
		
		Hooks.callAll(cModuleName + "." + "UnMount", pRider, pRidden, pFamiliar);
	} 
	
	//Aditional Informations
	
	static TokencanMount (pRider, pRidden, pFamiliar = false) {
		
		if (!RideableFlags.RidingLoop(pRider, pRidden)) {
			//prevent riding loops
			
			if (RideableFlags.TokenhasRidingPlace(pRidden, pFamiliar)) {
			//check if Token has place left to be ridden
			
				if (!game.settings.get(cModuleName, "PreventEnemyRiding") || !RideableUtils.areEnemies(pRider, pRidden) || game.user.isGM) {
				//Prevents enemy riding if enabled
					if (RideableUtils.MountingDistance(pRider, pRidden) >= 0) {
						let vInDistance = true;
						
						if (game.settings.get(cModuleName, "BorderDistance")) {
							vInDistance = (GeometricUtils.TokenBorderDistance(pRidden, pRider) <= RideableUtils.MountingDistance(pRider, pRidden));
						}
						else {
							vInDistance = (GeometricUtils.TokenDistance(pRidden, pRider) <= RideableUtils.MountingDistance(pRider, pRidden));
						}
						
						if (!vInDistance) {
							RideablePopups.TextPopUpID(pRider ,"Toofaraway", {pRiddenName : pRidden.name}); //MESSAGE POPUP	
						}
						
						return vInDistance;
					}
					else {
						return true;
					}
				}
				else {
					RideablePopups.TextPopUpID(pRider ,"EnemyRiding", {pRiddenName : pRidden.name}); //MESSAGE POPUP	
				}
			}
			else {
				RideablePopups.TextPopUpID(pRider ,"NoPlace", {pRiddenName : pRidden.name}); //MESSAGE POPUP
			}
		}
		else {
			//RideablePopups.TextPopUpID(pRider ,"RidingLoop", {pRiddenName : pRidden.name}); //MESSAGE POPUP
		}
		
		return false; //default
	}
	
	//Handel Token Creation/Deletion
	static async onTokenCreation(pTokenDocument, pInfos, pID) {
		//only relevant for GMs
		if (game.user.isGM) {		
			if (!RideableUtils.ignoreSpawn(pInfos)) {
				if (pInfos.RideableSpawn) {
					let vRideableInfos = pInfos.RideableInfos;
					
					if (vRideableInfos) {
						if (vRideableInfos.MountonSpawn) {
							MountingManager.MountRequest(vRideableInfos.MountonSpawn, [pTokenDocument.id], FCore.sceneof(pTokenDocument));
						}
					}
				}
				else {
					//spawn SpawnRideables
					let vSpawnRiders = RideableFlags.SpawnRiders(pTokenDocument);
					
					if (vSpawnRiders.length) {
						let vActors = await RideableUtils.SpawnableActors(vSpawnRiders);
						
						if (vActors.length) {
							RideableUtils.SpawnTokens(vActors, FCore.sceneof(pTokenDocument), pTokenDocument.x, pTokenDocument.y, {MountonSpawn: pTokenDocument.id});
						}
					}
				}
			}
		}
	}
	
	static onTokenDeletion(pToken) {
		//only relevant for GMs
		if (game.user.isGM) {
			if (pToken) {
				/* is bugged, fix later
				if (RideableFlags.isRider(pToken)) {
					MountingManager.UnMountSelectedGM([pToken]);
				}*/
				
				if (RideableFlags.isRidden(pToken)) {
					MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), FCore.sceneof(pToken)), false);
				}
				
				if (RideableFlags.isRider(pToken)) {
					MountingManager.UnMountSelectedGM([pToken], false);
				}
			}
		}
	}
}

//Hooks
Hooks.on("createToken", (...args) => MountingManager.onTokenCreation(...args));

Hooks.on("deleteToken", (...args) => MountingManager.onTokenDeletion(...args));

Hooks.on(cModuleName+".IndependentRiderMovement", (...args) => MountingManager.onIndependentRiderMovement(...args));

Hooks.on("ready", function() { EffectManager.preloadEffects(); });

//wrap and export functions

function MountSelected(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered); }

function MountSelectedFamiliar(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered, true); }

function MountRequest({ pTargetID, pselectedTokensID, pSceneID, pFamiliar } = {}) { return MountingManager.MountRequest(pTargetID, pselectedTokensID, pSceneID, pFamiliar); }

function UnMountSelected() { return MountingManager.UnMountSelected(); }

function UnMountRequest({ pselectedTokenIDs, pSceneID } = {}) {return MountingManager.UnMountRequest(pselectedTokenIDs, pSceneID); }

export { MountSelected, MountSelectedFamiliar, MountRequest, UnMountSelected, UnMountRequest };