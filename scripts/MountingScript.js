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
	static async MountSelected(pTargetHovered = false, pRidingOptions = {Familiar: false, Grappled: false}) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static async MountSelectedGM(pTarget, pselectedTokens, pRidingOptions) {} //starts riding flag distribution, marking pselectedTokens as riding pTarget
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pRidingOptions) {} //Request GM user to execute MountSelectedGM with given parameters
	
	static UnMountSelectedGM(pselectedTokens, pfromRidden = false, pRemoveRiddenreference = true) {} //remove all riding flags concerning pselectedTokens
	
	static UnMountSelected() {} //works out what tokens should be unmounted and calls request unmount on them
	
	static RequestUnmount(pTokens, pfromRidden = false) {} //exceutes a UnMountSelectedGM request socket for players or UnMountSelectedGM directly for GMs (pfromRidden if request came from ridden token)

	static UnMountRequest(pselectedTokenID , pSceneID, pfromRidden) {} //Request GM user to execute UnMountSelectedGM with given parameters (pfromRidden if request came from ridden token)
	
	static UnMountRiders(pRiddenToken, pRiders) {} //Unmounts all Tokens in pRiders that currently Ride pRiddenToken
	
	static UnMountallRiders(pRiddenToken) {} //Unmounts all Tokens that currently Ride pRiddenToken
	
	//Additional functions
	static onIndependentRiderMovement(pToken) {} //everything that happens upon a rider moving (besides the basics)
	
	static onMount(pRider, pRidden, pRidingOptions) {} //everything that happens upon a token mounting (besides the basics)
	
	static onUnMount(pRider, pRidden, pRidingOptions) {} //everything that happens upon a token unmounting (besides the basics)
	
	//Aditional Informations
	static TokencanMount (pRider, pRidden, pRidingOptions, pShowPopups = false) {} //returns if pRider can currently mount pRidden (ignores TokenisRideable and TokencanRide) (can also show appropiate popups with reasons why mounting failed)
	
	//Handel Token Creation/Deletion
	static async onTokenCreation(pTokenDocument, pInfos, pID) {} //Span on spawn tokens or mount if on spawn is active
	
	static onTokenDeletion(pToken) {} //Removes pToken from the Rider logic (both in Regards to Ridden and Riders)
	
	//IMPLEMENTATION
	//Basic Mounting /UnMounting	
	static async MountSelected(pTargetHovered = false,  pRidingOptions = {Familiar: false, Grappled: false}) {//!pRidingOptions should have only one option set to true!
		let vTarget = RideableUtils.targetedToken();
		let vSelected = RideableUtils.selectedTokens();
		
		if (pTargetHovered || !vTarget) {
			vTarget = RideableUtils.hoveredToken();
			
			if (!vTarget) {
				vTarget = RideableUtils.targetedToken();
			}
		}
		
		if (pRidingOptions.Grappled) {
			//switch target and selected for grapples
			let vBuffer = vTarget;
			
			vTarget = vSelected[0];
			vSelected = [vBuffer];
			
			if (RideableFlags.isGrappledby(vSelected[0], vTarget)) {
				//if it is already grappled, ungrapple instead
				MountingManager.UnMountSelected();
				
				return;
			}
		}
		
		//Make sure all riders can even ride the target
		await RideableFlags.recheckRiders(vTarget);
		
		let vValidRiders = vSelected.filter(vToken => MountingManager.TokencanMount(vToken, vTarget, pRidingOptions, true));
		
		if (pRidingOptions.Familiar) {
			//Familiar make sure selected are actually familairs of target
			vValidRiders = vValidRiders.filter(vToken => RideableUtils.TokenisFamiliarof(vToken, vTarget));
		}
		
		if (pRidingOptions.Grappled) {
			//add Grapple filter here
		}
		
		//fork dependent on GM status of user (either direct mount or mount request through Token ID send via socket)
		if (game.user.isGM) {
			MountingManager.MountSelectedGM(vTarget, vValidRiders, pRidingOptions);
		}
		else {
			if (!game.paused) {
				//call Hook so GM can give Riding effects
				if ((vTarget) && (vValidRiders.length > 0)) {
					let vcurrentTargetID = vTarget.id;
					
					let vselectedTokenIDs = RideableUtils.IDsfromTokens(vValidRiders);
					
					game.socket.emit("module.Rideable", {pFunction : "MountRequest", pData : {pTargetID: vcurrentTargetID, pselectedTokensID: vselectedTokenIDs, pSceneID : FCore.sceneof(vTarget).id, pRidingOptionFamiliar : pRidingOptions.Familiar, pRidingOptionGrappled : pRidingOptions.Grappled}});
				}
			}
		}
		
		return;
	}
	
	static async MountSelectedGM(pTarget, pselectedTokens, pRidingOptions, pScene = null) {
		//only works directly for GMs
		if (game.user.isGM) {		
			//make sure ptarget exists	
			if (((!pRidingOptions.Familiar) || (game.settings.get(cModuleName, "FamiliarRiding"))) && ((!pRidingOptions.Grappled) || (game.settings.get(cModuleName, "Grappling")))) {
				//Familiar riding can only be handled if setting is activated
				if (pTarget) {
					if (RideableFlags.TokenisRideable(pTarget) || pRidingOptions.Familiar || pRidingOptions.Grappled) {
						
						let vValidTokens = pselectedTokens.filter(vToken => !RideableFlags.isRider(vToken) && (vToken != pTarget)).slice(0, RideableFlags.TokenRidingSpaceleft(pTarget, pRidingOptions));
						
						if (vValidTokens.length) {
							let vpreviousRiders = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pTarget), FCore.sceneof(pTarget));
							
							if (pRidingOptions.Familiar) {
								//if a familiar was added only the familiars positions have to be updated
								vpreviousRiders = vpreviousRiders.filter(vToken => RideableFlags.isFamiliarRider(vToken));
							}
							
							if (pRidingOptions.Grappled) {
								//if a familiar was added only the familiars positions have to be updated
								vpreviousRiders = vpreviousRiders.filter(vToken => RideableFlags.isGrappled(vToken));
							}							
							
							await RideableFlags.addRiderTokens(pTarget, vValidTokens, pRidingOptions);
							
							UpdateRidderTokens(pTarget, vValidTokens.concat(vpreviousRiders), pRidingOptions);
							
							for (let i = 0; i < vValidTokens.length; i++) {
								MountingManager.onMount(vValidTokens[i], pTarget, pRidingOptions);
							}
						}
					}
				}
			}
		}
		
		return;
	}
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pRidingOptions) { 
		//Handels Mount request by matching TokenIDs to Tokens and mounting them
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			
			MountingManager.MountSelectedGM(RideableUtils.TokenfromID(pTargetID, vScene), RideableUtils.TokensfromIDs(pselectedTokensID, vScene), pRidingOptions);
		}
		
		return;
	}
	
	static UnMountSelectedGM(pselectedTokens, pfromRidden = false, pRemoveRiddenreference = true) {
		//verify pselectedToken exists
		if (pselectedTokens) {
			let vRiderTokens = pselectedTokens.filter(vToken => RideableFlags.isRider(vToken) && (!RideableFlags.isGrappled(vToken) || pfromRidden));//.filter(vToken => RideableFlags.isRider(vToken));
			let vRiddenTokens = [];
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				vRiddenTokens[i] = RideableFlags.RiddenToken(vRiderTokens[i]);
			}
				
			RideableFlags.stopRiding(vRiderTokens, pRemoveRiddenreference);
			
			UnsetRidingHeight(vRiderTokens, vRiddenTokens);
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				let vRiddenToken = RideableFlags.RiddenToken(vRiderTokens[i]);
				
				MountingManager.onUnMount(vRiderTokens[i], vRiddenTokens[i], {Familiar: RideableFlags.wasFamiliarRider(vRiderTokens[i]), Grappled: RideableFlags.wasGrappled(vRiderTokens[i])});
			}
		}
	}
	
	
	static UnMountSelected() {
		//fork dependent on GM status of user (either direct unmount or unmount request through Token ID send via socket)
		if (RideableUtils.selectedTokens().length > 0) {
			let vUnMountTokens = RideableUtils.selectedTokens();		
			let vTarget = RideableUtils.targetedToken();
			let vfromRidden = false;
			
			
			//to allow mounts to unmount targeted rider
			if (vTarget) {
				if (RideableFlags.isRiddenby(RideableUtils.selectedTokens()[0], vTarget)) {
					vUnMountTokens = [vTarget];
					vfromRidden = true;
				}
			}
			
			MountingManager.RequestUnmount(vUnMountTokens, vfromRidden);
		}
	}
	
	static RequestUnmount(pTokens, pfromRidden = false) {
		if (game.user.isGM) {
			MountingManager.UnMountSelectedGM(pTokens, pfromRidden);
		}
		else {
			if (!game.paused && pTokens.length) {
				let vUnMountTokensIDs = RideableUtils.IDsfromTokens(pTokens);
				
				game.socket.emit("module.Rideable", {pFunction : "UnMountRequest", pData : {pselectedTokenIDs: vUnMountTokensIDs, pSceneID : FCore.sceneof(pTokens[0]).id, pfromRidden: pfromRidden}});
			}
		}
	} 
	
	static UnMountRequest( pselectedTokenIDs, pSceneID, pfromRidden) { 
		//Handels UnMount request by matching TokenIDs to Tokens and unmounting them
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(pselectedTokenIDs, vScene), pfromRidden);
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
	
	static onMount(pRider, pRidden, pRidingOptions) {
		if (pRider) {
			
			if (pRidden) {
				if (pRidingOptions.Familiar) {
					RideablePopups.TextPopUpID(pRider ,"MountingFamiliar", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
				else {
					if (pRidingOptions.Grappled) {
						RideablePopups.TextPopUpID(pRider ,"Grappling", {pRiddenName : pRidden.name}); //MESSAGE POPUP
					}
					else {
						RideablePopups.TextPopUpID(pRider ,"Mounting", {pRiddenName : pRidden.name}); //MESSAGE POPUP
					}
				}
			}
			
			//Aplly mounted effect if turned on
			if (game.settings.get(cModuleName, "RidingSystemEffects") && !(RideableFlags.isFamiliarRider(pRider) || RideableFlags.isGrappled(pRider))) {
				if (EffectManager.getSystemMountingEffect()) {
					pRider.actor.createEmbeddedDocuments("Item", [EffectManager.getSystemMountingEffect()]);
				}
			}
		}
		
		Hooks.callAll(cModuleName + "." + "Mount", pRider, pRidden, pRidingOptions);
	} 
	
	static async onUnMount(pRider, pRidden, pRidingOptions) {
		if (pRider) {	
			if (pRidden) {
				if (pRidingOptions.Familiar) {
					RideablePopups.TextPopUpID(pRider ,"UnMountingFamiliar", {pRiddenName : pRidden.name}); //MESSAGE POPUP
				}
				else {
					if (pRidingOptions.Grappled) {
						RideablePopups.TextPopUpID(pRider ,"UnGrappling", {pRiddenName : pRidden.name}); //MESSAGE POPUP
					}
					else {
						RideablePopups.TextPopUpID(pRider ,"UnMounting", {pRiddenName : pRidden.name}); //MESSAGE POPUP
					}
				}
			}
			
			if (game.settings.get(cModuleName, "RidingSystemEffects")) {
				if (EffectManager.getSystemMountingEffect()) {
					await pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.filter(vElement => vElement.sourceId == EffectManager.getSystemMountingEffect().flags.core.sourceId).map(vElement => vElement.id));
				}
			}
		}
		
		Hooks.callAll(cModuleName + "." + "UnMount", pRider, pRidden, pRidingOptions);
	} 
	
	//Aditional Informations
	
	static TokencanMount (pRider, pRidden, pRidingOptions) {
		
		if (!RideableFlags.RidingLoop(pRider, pRidden)) {
			//prevent riding loops
			
			if (RideableFlags.TokenhasRidingPlace(pRidden, pRidingOptions)) {
			//check if Token has place left to be ridden
			
				if (!game.settings.get(cModuleName, "PreventEnemyRiding") || !RideableUtils.areEnemies(pRider, pRidden) || game.user.isGM || pRidingOptions.Grappled) {
				//Prevents enemy riding if enabled (override as GM and for grapples)
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
							MountingManager.MountRequest(vRideableInfos.MountonSpawn, [pTokenDocument.id], FCore.sceneof(pTokenDocument), {});
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
					MountingManager.UnMountSelectedGM([pToken], false, false);
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

function MountSelectedFamiliar(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered, {Familiar: true}); }

function GrappleTargeted() { return MountingManager.MountSelected(false, {Grappled: true})};

function MountRequest({ pTargetID, pselectedTokensID, pSceneID, pRidingOptionFamiliar, pRidingOptionGrappled } = {}) { return MountingManager.MountRequest(pTargetID, pselectedTokensID, pSceneID, {Familiar: pRidingOptionFamiliar, Grappled: pRidingOptionGrappled}); }

function UnMountSelected() { return MountingManager.UnMountSelected(); }

function UnMountRequest({ pselectedTokenIDs, pSceneID, pfromRidden } = {}) {return MountingManager.UnMountRequest(pselectedTokenIDs, pSceneID, pfromRidden); }

export { MountSelected, MountSelectedFamiliar, GrappleTargeted, MountRequest, UnMountSelected, UnMountRequest };