import * as FCore from "./CoreVersionComp.js";

import { RideableFlags } from "./helpers/RideableFlags.js";
import { GeometricUtils } from "./utils/GeometricUtils.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";
import { UpdateRidderTokens, UnsetRidingHeight, cGrapplePlacements } from "./RidingScript.js";
import { TileUtils } from "./utils/TileUtils.js";
import { EffectManager } from "./helpers/EffectManager.js";

const cRideableIcon = "fas fa-horse";

//can be called by macros to quickly control the Riding functionality and handels a few additional settings regarding mounting
class MountingManager {
	//DECLARATIONS
	//Basic Mounting
	static async MountSelected(pTargetHovered = false, pRidingOptions = {Familiar: false, Grappled: false}) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static async MountSelectedGM(pTarget, pselectedTokens, pRidingOptions) {} //starts riding flag distribution, marking pselectedTokens as riding pTarget
	
	static RequestMount(pselectedTokens, pTarget, pRidingOptions) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static RequestMountbyID(pselectedTokens, pTarget, pRidingOptions, pSceneID = null) {} //exceutes a MountSelectedGM request socket for players or MountSelectedGM directly for GMs
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pRidingOptions) {} //Answer request for GM user to execute MountSelectedGM with given parameters
	
	//Basic Unmounting
	static async UnMountSelectedGM(pselectedTokens, pfromRidden = false, pRemoveRiddenreference = true) {} //remove all riding flags concerning pselectedTokens
	
	static UnMountSelected() {} //works out what tokens should be unmounted and calls request unmount on them
	
	static RequestUnmount(pTokens, pfromRidden = false) {} //exceutes a UnMountSelectedGM request socket for players or UnMountSelectedGM directly for GMs (pfromRidden if request came from ridden token)
	
	static RequestUnmountbyID(pTokens, pfromRidden = false, pSceneID = null) {} //exceutes a UnMountSelectedGM request socket for players or UnMountSelectedGM directly for GMs (pfromRidden if request came from ridden token)

	static UnMountRequest(pselectedTokenID , pSceneID, pfromRidden) {} //Answer request for GM user to execute UnMountSelectedGM with given parameters (pfromRidden if request came from ridden token)
	
	static UnMountRiders(pRiddenToken, pRiders) {} //Unmounts all Tokens in pRiders that currently Ride pRiddenToken
	
	static UnMountallRiders(pRiddenToken) {} //Unmounts all Tokens that currently Ride pRiddenToken
	
	static UnMountallRidersbyID(pRiddenToken, pSceneID = null) {} //Unmounts all Tokens that currently Ride pRiddenToken
	
	//more mounting/Unmounting
	static async ToggleMountselected(pTargetHovered = false,  pRidingOptions = {Familiar: false, Grappled: false}) {} //toggles the mount status of the selected tokens regaridng the targeted/hovered token
	
	static RequestToggleMount(pselectedTokens, pTarget, pRidingOptions = {Familiar: false, Grappled: false}, vfromRidden = false) {} //starts appropiate mount/unmount requests for pselectedTokens
	
	//placement
	static async ToggleGrapplePlacement(pTokens) {} //Toggles the Grapple placements of pTokens
	
	static ToggleGrapplePlacementSelected() {} //Taggles the Grapple placements of the selected tokens
	
	//piloting
	static async TogglePiloting(pTokens) {} //Toggles the piloting of pTokens
	
	static TogglePilotingSelected() {} //Toggles the piloting of the selected tokens
	
	//ui
	static addMountingButton(pHUD, pHTML, pToken) {} //checks if a button should be added and adds it
	
	//Additional functions
	static async TogglePositionLock(pTokens, pshowMessage = true) {} //toggles the position lock of pToken and shows an appropiate message
	
	static onIndependentRiderMovement(pToken) {} //everything that happens upon a rider moving (besides the basics)
	
	static async onMount(pRider, pRidden, pRidingOptions) {} //everything that happens upon a token mounting (besides the basics)
	
	static async onUnMount(pRider, pRidden, pRidingOptions) {} //everything that happens upon a token unmounting (besides the basics)
	
	static async onstartPiloting(pRider, pRidden, pRidingOptions) {} //called when pRider starts piloting pRidden
	
	static async onstopPiloting(pRider, pRidden, pRidingOptions) {} //called when pRider stops piloting pRidden
	
	static async onpasteToken(pOriginal, pCopyData) {} //called when a token is copied, tries to also copy all riding tokens
	
	static onTokenControl(pToken, pControlled) {} //called when a token is controlled/uncontrolled
	
	static onRideableEffectDeletion(pEffect, pUser, pInfos) {} //called when a Rideable effect is deleted
	
	static async createCopywithRiders(pData, pSourceScene) {} //creates copies of pData at current scene with riders from pSourceScene
	
	static CheckEntering(pToken, pchanges, pInfos, pID) {} //called on token updates to check if they enter a MountonENter tile/token
	
	static ProxySelect(pToken) {} //called to start a proxy select
	
	//Aditional Informations
	static TokencanMount (pRider, pRidden, pRidingOptions, pShowPopups = false) {} //returns if pRider can currently mount pRidden (ignores TokenisRideable and TokencanRide) (can also show appropiate popups with reasons why mounting failed)
	
	//Handel Token Creation/Deletion
	static async onTokenCreation(pTokenDocument, pInfos, pID) {} //Span on spawn tokens or mount if on spawn is active
	
	static onTokenDeletion(pToken) {} //Removes pToken from the Rider logic (both in Regards to Ridden and Riders)
	
	//IMPLEMENTATION
	//Basic Mounting	
	static async MountSelected(pTargetHovered = false,  pRidingOptions = {Familiar: false, Grappled: false}) {//!pRidingOptions should have only one option set to true!
		let vTarget = RideableUtils.targetedToken();
		let vSelected = RideableUtils.selectedTokens();
		
		if (pTargetHovered || !vTarget) {
			vTarget = RideableUtils.hoveredRideableToken();
			
			if (game.settings.get(cModuleName, "allowTileRiding")) {
				if (!vTarget) {
					vTarget = TileUtils.hoveredRideableTile();
				}
			}
			
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
				MountingManager.UnMountSelected(pTargetHovered);
				
				return;
			}
		}
		
		//Make sure all riders can even ride the target
		//await RideableFlags.recheckRiders(vTarget);
		
		/*
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
					
					game.socket.emit("module.Rideable", {pFunction : "MountRequest", pData : {pTargetID: vcurrentTargetID, pselectedTokensID: vselectedTokenIDs, pSceneID : FCore.sceneof(vTarget).id, pRidingOptions : pRidingOptions}});
				}
			}
		}
		*/
		
		MountingManager.RequestMount(vSelected, vTarget, pRidingOptions);
		
		return;
	}
	
	static async MountSelectedGM(pTarget, pselectedTokens, pRidingOptions) {
		//only works directly for GMs
		if (game.user.isGM) {		
			//make sure ptarget exists	
			if (((!pRidingOptions.Familiar) || (game.settings.get(cModuleName, "FamiliarRiding"))) && ((!pRidingOptions.Grappled) || (game.settings.get(cModuleName, "Grappling")))) {
				//Familiar riding can only be handled if setting is activated
				if (pTarget) {
					if ((RideableFlags.TokenisRideable(pTarget, true) && RideableUtils.issettingMountableandUn(pTarget, true)) || pRidingOptions.Familiar || pRidingOptions.Grappled) {
						
						let vValidTokens = pselectedTokens.filter(vToken => !RideableFlags.isRider(vToken) && (vToken != pTarget)).slice(0, RideableFlags.TokenRidingSpaceleft(pTarget, pRidingOptions));
						
						vValidTokens = vValidTokens.filter(vToken => MountingManager.TokencanMount(vToken, pTarget, pRidingOptions, true));
		
						if (pRidingOptions.Familiar) {
							
							vValidTokens = vValidTokens.filter(vToken => RideableUtils.TokenisFamiliarof(vToken, pTarget));
						}
						
						if (pRidingOptions.Grappled) {
							vValidTokens = vValidTokens.filter(vToken => RideableFlags.canbeGrappled(vToken));
						}
		
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
							
							for (let i = 0; i < vValidTokens.length; i++) {
								await MountingManager.onMount(vValidTokens[i], pTarget, pRidingOptions);
							}
							
							UpdateRidderTokens(pTarget, vValidTokens.concat(vpreviousRiders));
						}
					}
				}
			}
		}
		
		return;
	}
	
	static RequestMount(pselectedTokens, pTarget, pRidingOptions) {
		//starts a mount reequest
		if (pTarget) {
			pRidingOptions.isGM = game.user.isGM;
			
			if (game.user.isGM) {
				MountingManager.MountSelectedGM(pTarget, pselectedTokens, pRidingOptions);
			}
			else {
				if (!game.paused) {
					game.socket.emit("module.Rideable", {pFunction : "MountRequest", pData : {pTargetID: pTarget.id, pselectedTokensID: RideableUtils.IDsfromTokens(pselectedTokens), pSceneID : FCore.sceneof(pTarget).id, pRidingOptions : pRidingOptions}});
				}
			}
		}
	} 
	
	static RequestMountbyID(pselectedTokens, pTarget, pRidingOptions, pSceneID = null) {
		MountingManager.RequestMount(RideableUtils.TokensfromIDs(pselectedTokens, pSceneID), RideableUtils.TokenfromID(pTarget, pSceneID), pRidingOptions);
	}
	
	static MountRequest(pTargetID, pselectedTokensID, pSceneID, pRidingOptions) { 
		//Handels Mount request by matching TokenIDs to Tokens and mounting them
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			
			MountingManager.MountSelectedGM(RideableUtils.TokenfromID(pTargetID, vScene), RideableUtils.TokensfromIDs(pselectedTokensID, vScene), pRidingOptions);
		}
		
		return;
	}
	
	//Basic Unmounting
	static async UnMountSelectedGM(pselectedTokens, pfromRidden = false, pRemoveRiddenreference = true) {
		//verify pselectedToken exists
		if (pselectedTokens) {
			let vRiderTokens = pselectedTokens.filter(vToken => RideableFlags.isRider(vToken) && (!RideableFlags.isGrappled(vToken) || pfromRidden));
			vRiderTokens = vRiderTokens.filter(vRider => RideableUtils.issettingMountableandUn(RideableFlags.RiddenToken(vRider), true)); //check if Ridden is Unmountable
			
			let vRiddenTokens = [];
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				vRiddenTokens[i] = RideableFlags.RiddenToken(vRiderTokens[i]);
			}
				
			await RideableFlags.stopRiding(vRiderTokens, pRemoveRiddenreference);
			
			UnsetRidingHeight(vRiderTokens, vRiddenTokens);
			
			for (let i = 0; i < vRiderTokens.length; i++) {
				let vRiddenToken = RideableFlags.RiddenToken(vRiderTokens[i]);
				
				MountingManager.onUnMount(vRiderTokens[i], vRiddenTokens[i], {Familiar: RideableFlags.wasFamiliarRider(vRiderTokens[i]), Grappled: RideableFlags.wasGrappled(vRiderTokens[i])});
			}
		}
	}
	
	
	static UnMountSelected() {
		if (RideableUtils.selectedTokens().length > 0) {
			let vUnMountTokens = RideableUtils.selectedTokens();		
			let vTarget = RideableUtils.targetedToken();
			let vfromRidden = false;
			
			if (!vTarget) {
				vTarget = RideableUtils.hoveredRideableToken();
			}
			
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
	
	static RequestUnmountbyID(pTokens, pfromRidden = false, pSceneID = null) {
		MountingManager.RequestUnmount(RideableUtils.TokensfromIDs(pTokens, pSceneID), pfromRidden);
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
			MountingManager.UnMountRiders(pRiddenToken, RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pRiddenToken), FCore.sceneof(pRiddenToken)));
		}
	} 
	
	static UnMountallRidersbyID(pRiddenToken, pSceneID = null) {
		MountingManager.UnMountallRiders(RideableUtils.TokenfromID(pRiddenToken, pSceneID));
	}
	
	//more mounting/Unmounting
	static async ToggleMountselected(pTargetHovered = false,  pRidingOptions = {Familiar: false, Grappled: false}) {
		let vTargets = RideableUtils.targetedTokens();
		let vSelected = RideableUtils.selectedTokens();
		let vfromRidden = false;
					
		if (pTargetHovered || !vTargets.length) {
			vTargets = vTargets.concat([RideableUtils.hoveredRideableToken()]);
			
			if (game.settings.get(cModuleName, "allowTileRiding")) {
				if (!vTargets.length) {
					vTargets = vTargets.concat([TileUtils.hoveredRideableTile()]);
				}
			}
		}
		
		if (pRidingOptions.Grappled) {
			//switch target and selected for grapples
			let vBuffer = vTargets;
			
			vTargets = vSelected;
			vSelected = vBuffer;
		}
		
		//Make sure all riders can even ride the target
		/*
		if (vTargets.length) {
			await RideableFlags.recheckRiders(vTargets[0]);
		}
		*/
		
		MountingManager.RequestToggleMount(vSelected, vTargets[0], pRidingOptions, vfromRidden);
		
		return;
	}
	
	static RequestToggleMount(pselectedTokens, pTarget, pRidingOptions = {Familiar: false, Grappled: false}, vfromRidden = false) {	
		let vselectedTokens = pselectedTokens.filter(vToken => vToken);
		
		let vCurrentRiders = vselectedTokens.filter(vRider => (pTarget && (RideableFlags.isRiddenby(pTarget, vRider) || (pRidingOptions.Grappled && RideableFlags.isGrappledby(vRider, pTarget)))) || (!pTarget && (RideableFlags.isRider(vRider))));
		
		let vCurrentNotRiders = vselectedTokens.filter(vToken => !RideableFlags.isRider(vToken));
		
		if (vCurrentRiders.length) {
			MountingManager.RequestUnmount(vCurrentRiders, vfromRidden = (vfromRidden || pRidingOptions.Grappled));
		}
		else {
			if (vCurrentNotRiders.length && pTarget) {
				MountingManager.RequestMount(vCurrentNotRiders, pTarget, pRidingOptions);
			}
		}
	}
	
	//placement
	static async ToggleGrapplePlacement(pTokens) {
		for (let i = 0; i < pTokens.length; i++) {
			if (pTokens[i].isOwner) {
				switch (RideableFlags.GrapplePlacement(pTokens[i])) {
					case cGrapplePlacements[1]:
						await RideableFlags.setGrapplePlacement(pTokens[i], cGrapplePlacements[0]);
						break;
					default:
						await RideableFlags.setGrapplePlacement(pTokens[i], cGrapplePlacements[1]);
				}
				
				UpdateRidderTokens();
			}
		}
	}
	
	static ToggleGrapplePlacementSelected() {
		MountingManager.ToggleGrapplePlacement(RideableUtils.selectedTokens());
	}
	
	//piloting
	static async TogglePiloting(pTokens) {
		for (let i = 0; i < pTokens.length; i++) {
			if (pTokens[i].isOwner) {
				if (await RideableFlags.TogglePiloting(pTokens[i])) {
					if (RideableFlags.isPiloting(pTokens[i])) {
						MountingManager.onstartPiloting(pTokens[i], RideableFlags.RiddenToken(pTokens[i]), {});
					}
					else {
						MountingManager.onstopPiloting(pTokens[i], RideableFlags.RiddenToken(pTokens[i]), {});
					}
				}
				else {
					let vRidden = RideableFlags.RiddenToken(pTokens[i]);
					if (vRidden) {
						RideablePopups.TextPopUpID(pTokens[i] ,"cantPilot", {pRiddenName : RideableFlags.RideableName(vRidden)}); //MESSAGE POPUP
					}
				}
			}
		}		
	} 
	
	static TogglePilotingSelected() {
		MountingManager.TogglePiloting(RideableUtils.selectedTokens());
	}
	
	//ui
	static addMountingButton(pHUD, pHTML, pToken) {
		if (RideableFlags.TokenisRideable(pToken)) {
			let vButtonPosition = game.settings.get(cModuleName, "MountButtonPosition");
			
			if (vButtonPosition == "default") {
				vButtonPosition = game.settings.get(cModuleName, "MountButtonDefaultPosition");
			}
			
			if (vButtonPosition != "none") {		
				let vButtonHTML = `<div class="control-icon" data-action="mount">
									<i class="${cRideableIcon}"></i>
							   </div>`;
				
				pHTML.find("div.col."+vButtonPosition).append(vButtonHTML);
				
				let vButton = pHTML.find(`div[data-action="mount"]`);
				
				let vRiders = RideableUtils.selectedTokens();
				
				let vMount = RideableUtils.TokenfromID(pToken._id);
				
				if (vRiders.length == 1 && vMount == vRiders[0]) {
					//only the "to mount" token is selected
					if (game.user.character) {
						vRiders = vRiders.concat(canvas.tokens.placeables.filter(vToken => vToken.actor == game.user.character).map(pToken => pToken.document));
					}
				}
				
				vButton.click((pEvent) => {MountingManager.RequestToggleMount(vRiders, vMount)});
			}
		}
	}
	
	//Additional functions	
	static async TogglePositionLock(pTokens, pshowMessage = true) {
		let vTokens = pTokens.filter(vToken => vToken.isOwner);
		
		for (let i = 0; i < vTokens.length; i++) {
			if ((await RideableFlags.togglePositionLock(vTokens[i])) && pshowMessage) {
				if (RideableFlags.hasPositionLock(vTokens[i])) {
					RideablePopups.TextPopUpID(pTokens[i] ,"PositionLocked"); //MESSAGE POPUP
				}
				else {
					RideablePopups.TextPopUpID(pTokens[i] ,"PositionUnlocked"); //MESSAGE POPUP
				}
			}
		}
	} 
	
	static onIndependentRiderMovement(pToken, pChanges) {
		if (RideableFlags.isRider(pToken)) {
			if (RideableUtils.getRiderMovementsetting() == "RiderMovement-dismount") {
				if (pChanges.hasOwnProperty("x") || pChanges.hasOwnProperty("y") || pChanges.hasOwnProperty("elevation")) {
					MountingManager.RequestUnmount([pToken]);
				}
			}
		}
	}
	
	static async onMount(pRider, pRidden, pRidingOptions) {
		if (pRider) {
			
			if (pRidden) {
				if (pRidingOptions.Familiar) {
					RideablePopups.TextPopUpID(pRider ,"MountingFamiliar", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
				}
				else {
					if (pRidingOptions.Grappled) {
						RideablePopups.TextPopUpID(pRider ,"Grappling", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
					}
					else {
						RideablePopups.TextPopUpID(pRider ,"Mounting", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
					}
				}
			}
			
			if (game.settings.get(cModuleName, "FitRidersize")) {
				RideableFlags.savecurrentSize(pRider);
			}
			
			RideableFlags.ApplyRidersScale(pRidden, [pRider]);
		}
		
		EffectManager.onRiderMount(pRider, pRidden, pRidingOptions);
		
		MountingManager.ProxySelect(pRider);
		
		Hooks.callAll(cModuleName + "." + "Mount", pRider, pRidden, pRidingOptions);
	} 
	
	static async onUnMount(pRider, pRidden, pRidingOptions) {
		if (pRider) {	
			if (pRidden) {
				if (pRidingOptions.Familiar) {
					RideablePopups.TextPopUpID(pRider ,"UnMountingFamiliar", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
				}
				else {
					if (pRidingOptions.Grappled) {
						RideablePopups.TextPopUpID(pRider ,"UnGrappling", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
					}
					else {
						RideablePopups.TextPopUpID(pRider ,"UnMounting", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
					}
				}
			}
			
			if (game.settings.get(cModuleName, "FitRidersize")) {
				RideableFlags.resetSize(pRider);
			}
			
			RideableFlags.resetScale(pRider);
			
			RideableFlags.resetPositionLock(pRider);
		}
		
		EffectManager.onRiderUnMount(pRider, pRidden, pRidingOptions);
		
		Hooks.callAll(cModuleName + "." + "UnMount", pRider, pRidden, pRidingOptions);
	}
	
	static async onstartPiloting(pRider, pRidden, pRidingOptions) {
		if (pRider) {	
			if (pRidden) {
				RideablePopups.TextPopUpID(pRider ,"startPiloting", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
			}
		}	

		Hooks.callAll(cModuleName + "." + "startPiloting", pRider, pRidden, pRidingOptions);
	}
	
	static async onstopPiloting(pRider, pRidden, pRidingOptions) {
		if (pRider) {	
			if (pRidden) {
				RideablePopups.TextPopUpID(pRider ,"stopPiloting", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
			}
		}
		
		Hooks.callAll(cModuleName + "." + "stopPiloting", pRider, pRidden, pRidingOptions);
	}

	static async onpasteToken(pOriginal, pCopyData) {
		if (game.user.isGM) {
			if (pOriginal.length > 0) {
				let vSourceScene = FCore.sceneof(pOriginal[0].document);
				
				let vRiddenTokens = pCopyData.filter(vData => RideableFlags.isRidden(vData));
				
				let vBlacklist = [];
				
				let vRiderIDs = [];
				
				for (let i = 0; i < vRiddenTokens.length; i++) {
					vRiderIDs = vRiderIDs.concat(RideableFlags.RiderTokenIDs(vRiddenTokens[i]));
				}
				
				//pCopyData = pCopyData.filter(vToken => !vRiddenTokens.includes(vToken) && !vRiderIDs.includes(vToken.id));
				let j = 0;
				
				let visRider;
				let visRidden;
				
				while (j < pCopyData.length) {
					visRider = vRiderIDs.includes(pOriginal[j].id)
					visRidden = vRiddenTokens.includes(pCopyData[j])
					
					if (visRidden || visRider) {
						if (visRidden && visRider) {
							vBlacklist.push(pCopyData[j]);
						}
						
						pCopyData.splice(j, 1);
						pOriginal.splice(j, 1);
					}
					else {
						j = j + 1;
					}
				}	

				vRiddenTokens = vRiddenTokens.filter(vToken => !vBlacklist.includes(vToken));
				
				MountingManager.createCopywithRiders(vRiddenTokens, vSourceScene);
			}
		}
	}
	
	static onTokenControl(pToken, pControlled) {
		let vToken = pToken.document;
		
		if (pControlled) {
			MountingManager.ProxySelect(vToken);
		}
	}
	
	static onRideableEffectDeletion(pEffect, pUser, pInfos) {
		if (pInfos.GrappleEffect) {
			if (game.settings.get(cModuleName, "StopGrappleonEffectRemoval")) {
				let vGrappled = canvas.tokens.placeables.filter(vToken => vToken.actor == pEffect.parent);
				
				vGrappled = vGrappled.map(vToken => vToken.document);
				
				vGrappled = vGrappled.filter(vToken => RideableFlags.isGrappled(vToken));
				
				MountingManager.RequestUnmount(vGrappled, true);
			}
		}
	}
	
	static async createCopywithRiders(pData, pSourceScene) {
		let vCreations = [];
		
		for (let i = 0; i < pData.length; i++) {
			let vRiderIDs = RideableFlags.RiderTokenIDs(pData[i]);
			
			let vRiderTokens = RideableUtils.TokensfromIDs(vRiderIDs, pSourceScene);
			
			let vRidden;
			
			vRiderTokens = foundry.utils.duplicate(vRiderTokens);
			
			for (let j = 0; j < vRiderTokens.length; j++) {
				vRiderTokens[j].x = pData[i].x;
				vRiderTokens[j].y = pData[i].y;
			}
			
			let vRiderReplacement = await MountingManager.createCopywithRiders(vRiderTokens, pSourceScene);
			
			pData[i].flags[cModuleName]["RidersFlag"] = vRiderReplacement.map(vToken => vToken.id);
			
			vRidden = await canvas.scene.createEmbeddedDocuments(Token.embeddedName, [pData[i]], { RideableSpawn: true});
			
			UpdateRidderTokens(vRidden[0]);
			
			vCreations = vCreations.concat(vRidden);
		}
		
		return vCreations;
	}
	
	static CheckEntering(pToken, pChanges, pInfos, pID) {
		if ((pChanges.hasOwnProperty("x") || pChanges.hasOwnProperty("y")) && game.settings.get(cModuleName, "allowMountingonEntering") && pID == game.user.id && !RideableFlags.isRider(pToken)) {
			let vNewPosition = GeometricUtils.updatedGeometry(pToken, pChanges);

			let vMoEobjects = canvas.tokens.placeables.map(vToken => vToken.document).filter(vToken => RideableFlags.MountonEnter(vToken));
			
			if (game.settings.get(cModuleName, "allowTileRiding")) {
				vMoEobjects = vMoEobjects.concat(canvas.tiles.placeables.map(vTile => vTile.document).filter(vTile => RideableFlags.MountonEnter(vTile)));
			}
			
			vMoEobjects = vMoEobjects.filter(vToken => GeometricUtils.withinBoundaries(vToken, RideableFlags.TokenForm(vToken), vNewPosition)); //filter entered MoE objects
			
			vMoEobjects = vMoEobjects.filter(vMoEObject => RideableFlags.isvalidAutomount(vMoEObject, pToken));
			
			if (vMoEobjects.length) {
				MountingManager.RequestMount([pToken], vMoEobjects.sort((a, b) => {return a.elevation - b.elevation})[0], {MountbyEnter : true});
			}
		}
	}
	
	static ProxySelect(pToken) {
		if (canvas.tokens.controlled.length == 1) {
			if (game.settings.get(cModuleName, "RiderProxySelect") != "never") {
				switch (game.settings.get(cModuleName, "RiderProxySelect")) {
					case "familiar":
					case "always":
						if (RideableFlags.isRider(pToken)) {
							if (!RideableFlags.isGrappled(pToken)) {
								if (game.settings.get(cModuleName, "RiderProxySelect") == "always" || RideableFlags.isFamiliarRider(pToken)) {
									let vRidden = RideableFlags.RiddenToken(pToken)?.object;
									
									let vToken = pToken?.object;
									
									if (vRidden && vToken && vRidden.owner) {
										vToken.release();
									
										vRidden.control();
									}
								}
							}
						}
						break;
					case "allRiders":
						if (RideableFlags.isRidden(pToken)) {
							let vRiders = RideableFlags.RiderTokens(pToken);
							
							for (let vRider of vRiders) {
								vRider.object.control({releaseOthers : false});
							}
						}
				}
			}
		}
	}
	
	//Aditional Informations
	
	static TokencanMount (pRider, pRidden, pRidingOptions) {
		
		if (!RideableFlags.RidingLoop(pRider, pRidden) && !RideableUtils.isConnected(pRider, pRidden)) {
			//prevent riding loops
			
			if (RideableFlags.TokenhasRidingPlace(pRidden, pRidingOptions)) {
			//check if Token has place left to be ridden
				if (!game.settings.get(cModuleName, "PreventEnemyRiding") || !RideableUtils.areEnemies(pRider, pRidden) || pRidingOptions.isGM || pRidingOptions.Grappled) {
				//Prevents enemy riding if enabled (override as GM and for grapples)
					if (pRidingOptions.MountbyEnter || RideableUtils.WithinMountingDistance(pRider, pRidden)) {
						return true;
					}
					else {
						RideablePopups.TextPopUpID(pRider ,"Toofaraway", {pRiddenName : RideableFlags.RideableName(pRidden)});
						return false;
					}
				}
				else {
					RideablePopups.TextPopUpID(pRider ,"EnemyRiding", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP	
				}
			}
			else {
				RideablePopups.TextPopUpID(pRider ,"NoPlace", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
			}
		}
		else {
			//RideablePopups.TextPopUpID(pRider ,"RidingLoop", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP
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
					MountingManager.UnMountSelectedGM(RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), FCore.sceneof(pToken)), true, false);
				}
				
				if (RideableFlags.isRider(pToken)) {
					MountingManager.UnMountSelectedGM([pToken], true, false);
				}
			}
		}
	}
}

//Hooks
Hooks.on("createToken", (...args) => MountingManager.onTokenCreation(...args));

Hooks.on("deleteToken", (...args) => MountingManager.onTokenDeletion(...args));

Hooks.on("updateToken", (...args) => MountingManager.CheckEntering(...args));

Hooks.on("renderTokenHUD", (...args) => MountingManager.addMountingButton(...args));

Hooks.on(cModuleName+".IndependentRiderMovement", (...args) => MountingManager.onIndependentRiderMovement(...args));

Hooks.on(cModuleName + ".RideableEffectDeletion", (pEffect, pUser, pInfos) => MountingManager.onRideableEffectDeletion(pEffect, pUser, pInfos));

Hooks.on("pasteToken", async (...args) => {await MountingManager.onpasteToken(...args)});

Hooks.on("controlToken", (...args) => MountingManager.onTokenControl(...args));

//Hooks.on(cModuleName+".RideableEffectDeletion", (...args) => MountingManager.onRideableEffectDeletion(...args));

//wrap and export functions

function MountSelected(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered); }

function MountSelectedFamiliar(pTargetHovered = false) { return MountingManager.MountSelected(pTargetHovered, {Familiar: true}); }

function ToggleMountselected(pTargetHovered = false) {return MountingManager.ToggleMountselected(pTargetHovered); }

function GrappleTargeted(pTargetHovered = false) { return MountingManager.ToggleMountselected(pTargetHovered, {Grappled: true})};

function UnMountSelected() { return MountingManager.UnMountSelected(); }

function Mount(pselectedTokens, pTarget, pRidingOptions = {}) { return MountingManager.RequestMount(pselectedTokens, pTarget, pRidingOptions)};

function UnMount(pTokens) { return MountingManager.RequestUnmount(pTokens)};

function ToggleMount(pRiders, pTarget, pRidingOptions = {}) {return MountingManager.RequestToggleMount(pRiders, pTarget, pRidingOptions);};

function UnMountallRiders(pRidden) { return MountingManager.UnMountallRiders(pRidden)};

function MountbyID(pselectedTokens, pTarget, pRidingOptions = {}, pSceneID = null) { return MountingManager.RequestMountbyID(pselectedTokens, pTarget, pRidingOptions, pSceneID)};

function UnMountbyID(pTokens, pSceneID = null) { return MountingManager.RequestUnmountbyID(pTokens, pSceneID)};

function UnMountallRidersbyID(pRidden, pSceneID = null) { return MountingManager.UnMountallRidersbyID(pRidden, pSceneID)};

function ToggleGrapplePlacementSelected() {return MountingManager.ToggleGrapplePlacementSelected()}

function TogglePilotingSelected() {return MountingManager.TogglePilotingSelected()}

function TogglePositionLock(pTokens, pshowMessage = true) {return MountingManager.TogglePositionLock(pTokens, pshowMessage)}

function TogglePositionLockSelected(pshowMessage = true) {return MountingManager.TogglePositionLock(RideableUtils.selectedTokens(), pshowMessage)}

//Request Handlers
function UnMountRequest({ pselectedTokenIDs, pSceneID, pfromRidden } = {}) {return MountingManager.UnMountRequest(pselectedTokenIDs, pSceneID, pfromRidden); }

function MountRequest({ pTargetID, pselectedTokensID, pSceneID, pRidingOptions} = {}) { return MountingManager.MountRequest(pTargetID, pselectedTokensID, pSceneID, pRidingOptions); }

export { MountSelected, MountSelectedFamiliar, GrappleTargeted, MountRequest, UnMountSelected, UnMountRequest, ToggleMountselected, ToggleGrapplePlacementSelected, TogglePilotingSelected, TogglePositionLock, TogglePositionLockSelected};

export { Mount, UnMount, ToggleMount, UnMountallRiders, MountbyID, UnMountbyID, UnMountallRidersbyID };