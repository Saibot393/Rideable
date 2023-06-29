import { RideableFlags } from "./RideableFlags.js";
import { RideableUtils, cModuleName } from "./RideableUtils.js";
import { UpdateRidderTokens, UnsetRidingHeight } from "./RidingScript.js";

var vSystemRidingEffect = null; //saves the systems mounting effects (if any)

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system

class MountingEffectManager {
	//DECLARATIONS
	static async preloadEffects() {} //preloads effects to make things smoother
	
	static getSystemMountingEffect() {} //returns an appropiate Mounting effect if the game system has one
	
	//IMPLEMENTATION
	static async preloadEffects() {
		if (RideableUtils.isPf2e()) {
			vSystemRidingEffect = (await fromUuid(cMountedPf2eEffectID)).toObject();
		} 
	}
	static getSystemMountingEffect() {
		
		if (vSystemRidingEffect) {
			return vSystemRidingEffect;
		}
		
		return;
	}
}

//can be called by macros to quickly control the Riding functionality and handels a few additional settings regarding mounting
class MountingManager {
	//DECLARATIONS
	//Basic Mounting /UnMounting
	static MountSelectedGM(pTarget, pselectedTokens) {} //starts riding flag distribution, marking pselectedTokens as riding pTarget
	
	static MountSelected(pTargetHovered = false) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static MountRequest(pTargetID, pselectedTokensID) {} //Request GM user to execute MountSelectedGM with given parameters
	
	static UnMountSelectedGM(pselectedTokens) {} //remove all riding flags concerning pselectedTokens
	
	static UnMountSelected() {} //works out what tokens should be unmounted and calls request unmount on them
	
	static RequestUnmount(pTokens) {} //exceutes a UnMountSelectedGM request socket for players or UnMountSelectedGM directly for GMs

	static UnMountRequest({ pselectedTokenID } = {}) {} //Request GM user to execute UnMountSelectedGM with given parameters
	
	static UnMountRiders(pRiddenToken, pRiders) {} //Unmounts all Tokens in pRiders that currently Ride pRiddenToken
	
	static UnMountallRiders(pRiddenToken) {} //Unmounts all Tokens that currently Ride pRiddenToken
	
	//Additional functions
	static onIndependentRiderMovement(pToken) {} //everything that happens upon a rider moving (besides the basics)
	
	static onMount(pToken) {} //everything that happens upon a token mounting (besides the basics)
	
	static onUnMount(pToken) {} //everything that happens upon a token unmounting (besides the basics)
	
	//Aditional Informations
	static TokencanMount (pRider, pRidden) {} //returns if pRider can currently mount pRidden (ignores TokenisRideable and TokencanRide)
	
	//Handel Token Deletion
	static onTokenDeletion(pToken) {} //Removes pToken from the Rider logic (both in Regards to Ridden and Riders)
	
	//IMPLEMENTATION
	//Basic Mounting /UnMounting
	static MountSelectedGM(pTarget, pselectedTokens) {
		//only works directly for GMs
		if (game.user.isGM) {		
			//make sure ptarget exists			
			if (pTarget) {
				if (RideableUtils.TokenisRideable(pTarget)) {
					let vValidTokens = pselectedTokens.filter(vToken => !RideableFlags.isRider(vToken) && (vToken != pTarget) && this.TokencanMount(vToken, pTarget));
					
					let vpreviousRiders = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pTarget));
					
					RideableFlags.addRiderTokens(pTarget, vValidTokens);
					
					UpdateRidderTokens(pTarget, vValidTokens.concat(vpreviousRiders));
					
					for (let i = 0; i < vValidTokens.length; i++) {
						MountingManager.onMount(vValidTokens[i]);
					}
				}
			}
		}
		
		return;
	}
	
	static MountSelected(pTargetHovered = false) {
		let vTarget = RideableUtils.targetedToken();
		
		if (pTargetHovered || !vTarget) {
			vTarget = RideableUtils.hoveredToken();
			
			if (!vTarget) {
				vTarget = RideableUtils.targetedToken();
			}
		}
		
		//fork dependent on GM status of user (either direct mount or mount request through Token ID send via socket)
		if (game.user.isGM) {
			MountingManager.MountSelectedGM(vTarget, RideableUtils.selectedTokens());
		}
		else {
			if (!game.paused) {
				//call Hook so GM can give Riding effects
				if ((vTarget) && (RideableUtils.selectedTokens().length > 0)) {
					let vcurrentTargetID = vTarget.id;
					
					let vselectedTokenIDs = RideableUtils.IDsfromTokens(RideableUtils.selectedTokens());
					
					game.socket.emit("module.Rideable", {pFunction : "MountRequest", pData : {pTargetID: vcurrentTargetID, pselectedTokensID: vselectedTokenIDs}});
				}
			}
		}
		
		return;
	}
	
	static MountRequest({ pTargetID, pselectedTokensID } = {}) { 
		//Handels Mount request by matching TokenIDs to Tokens and mounting them
		if (game.user.isGM) {
			MountingManager.MountSelectedGM(RideableUtils.TokenfromID(pTargetID), RideableUtils.TokensfromIDs(pselectedTokensID));
		}
		
		return;
	}
	
	static UnMountSelectedGM(pselectedTokens) {
		//verify pselectedToken exists
		if (pselectedTokens) {
			let vRiderTokens = pselectedTokens.filter(vToken => RideableFlags.isRider(vToken));//.filter(vToken => RideableFlags.isRider(vToken));
			
			RideableFlags.stopRiding(vRiderTokens);
			
			UnsetRidingHeight(vRiderTokens);
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				MountingManager.onUnMount(vRiderTokens[i]);
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
			if (!game.paused) {
				let vUnMountTokensIDs = RideableUtils.IDsfromTokens(pTokens);
				
				game.socket.emit("module.Rideable", {pFunction : "UnMountRequest", pData : {pselectedTokenIDs: vUnMountTokensIDs}});
			}
		}
	} 
	
	static UnMountRequest({ pselectedTokenIDs } = {}) { 
		//Handels UnMount request by matching TokenIDs to Tokens and unmounting them
		if (game.user.isGM) {
			MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(pselectedTokenIDs));
		}
	}
	
	static UnMountRiders(pRiddenToken, pRiders) {
		if ((pRiddenToken) && (pRiders)) {
			MountingManager.UnMountSelectedGM(pRiders.filter(vToken => RideableFlags.isRiddenby(pRiddenToken, vToken)));
		}
	} 
	
	static UnMountallRiders(pRiddenToken) {
		if (pRiddenToken) {
			MountingManager.UnMountRiders(RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pRiddenToken)));
		}
	} 
	
	//Additional functions
	
	static onIndependentRiderMovement(pToken) {
		if (RideableFlags.isRider(pToken)) {
			if (game.settings.get(cModuleName, "RiderMovement") == "RiderMovement-dismount") {
				MountingManager.RequestUnmount([pToken]);
			}
		}
	}
	
	static onMount(pToken) {
		if (game.settings.get(cModuleName, "RidingSystemEffects")) {
			if (MountingEffectManager.getSystemMountingEffect()) {
				pToken.actor.createEmbeddedDocuments("Item", [MountingEffectManager.getSystemMountingEffect()]);
			}
		}
	} 
	
	static async onUnMount(pToken) {
		if (pToken) {
			if (game.settings.get(cModuleName, "RidingSystemEffects")) {
				if (MountingEffectManager.getSystemMountingEffect()) {
					await pToken.actor.deleteEmbeddedDocuments("Item", pToken.actor.itemTypes.effect.filter(vElement => vElement.sourceId == MountingEffectManager.getSystemMountingEffect().flags.core.sourceId).map(vElement => vElement.id));
				}
			}
		}
	} 
	
	//Aditional Informations
	
	static TokencanMount (pRider, pRidden) {
		if (game.settings.get(cModuleName, "MountingDistance") >= 0) {
			if (game.settings.get(cModuleName, "BorderDistance")) {
				return (RideableUtils.TokenBorderDistance(pRidden, pRider) <= game.settings.get(cModuleName, "MountingDistance"));
			}
			else {
				return (RideableUtils.TokenDistance(pRidden, pRider) <= game.settings.get(cModuleName, "MountingDistance"));
			}
		}
		else {
			return true;
		}
	}
	
	//Handel Token Deletion
	static onTokenDeletion(pToken) {
		//only relevant for GMs
		if (game.user.isGM) {
			if (pToken) {
				/* is bugged, fix later
				if (RideableFlags.isRider(pToken)) {
					MountingManager.UnMountSelectedGM([pToken]);
				}*/
				
				if (RideableFlags.isRidden(pToken)) {
					MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken)));
				}
			}
		}
	}
}

//Hooks
Hooks.on("deleteToken", (...args) => MountingManager.onTokenDeletion(...args));

Hooks.on(cModuleName+".IndependentRiderMovement", (...args) => MountingManager.onIndependentRiderMovement(...args));

Hooks.on("ready", function() { MountingEffectManager.preloadEffects(); });

//wrap and export functions

function MountSelected(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered); }

function MountRequest({ pTargetID, pselectedTokensID } = {}) { return MountingManager.MountRequest({pTargetID, pselectedTokensID}); }

function UnMountSelected() { return MountingManager.UnMountSelected(); }

function UnMountRequest({ pselectedTokenIDs } = {}) {return MountingManager.UnMountRequest({pselectedTokenIDs}); }

export { MountSelected, MountRequest, UnMountSelected, UnMountRequest };