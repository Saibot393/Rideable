import { RideableFlags, cCornermaxRiders } from "./RideableFlags.js";
import { RideableUtils, cModuleName } from "./RideableUtils.js";

//CONSTANTS
const cbetterRiderPositioning = true; //for more complex positioning calculations

const cRidingEffectTokenImage = true; //set the Image of Riding effects to the Riding tokens image

//Ridingmanager will do all the work for placing riders
class Ridingmanager {
	//DECLARATIONS
	static OnTokenupdate(pDocument, pchanges, pInfos) {} //calculates which Tokens are Riders of priddenToken und places them on it
	
	static OnTokenpreupdate(pDocument, pchanges, pInfos, psendingUser) {} //Handles atempted movement of Riders
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //Works out where the Riders of a given token should be placed and calls placeRiderTokens to apply updates
	
	static planRiderTokens(pRiddenToken, pUpdateDocument, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //Works out where the Riders of pRiddenToken should move based on the updated pRiddenDocument and executes placeRiderTokens
	
	static placeRiderTokens(priddenToken, pRiderTokenList, pxoffset, pxdelta, pallFamiliars = false, pAnimations = true) {} //Set the Riders(pRiderTokenList) token based on the Inputs (pxoffset, pxdelta, pbunchedRiders) und the position of priddenToken
	
	static placeRiderTokenscorner(pUpdateDocument, pRiderTokenList, pAnimations = true) {} //places up to four tokens from pRiderTokenList on the corners of priddenToken
	
	static UnsetRidingHeight(pRiderTokens) {} //Reduces Tokens Elevation by Riding height
	
	//IMPLEMENTATIONS
	static OnTokenupdate(pDocument, pchanges, pInfos) {
		if (game.user.isGM) {
			let vToken = pDocument.object;
			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(vToken)) {
				//check if token position was actually changed
				if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation")) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(vToken));
					
					Ridingmanager.planRiderTokens(vToken, pDocument, vRiderTokenList, false, pInfos.animate);
				}
			}
		}
	}
	
	static OnTokenpreupdate(pDocument, pchanges, pInfos, psendingUser) {
		//Check if Token is Rider
		let vToken = pDocument.object;
		if (RideableFlags.isRider(vToken)) {
			if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation")) {
				if (!pInfos.RidingMovement) {
					if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow") {	
						//suppress movement
						delete pchanges.x;
						delete pchanges.y;
						delete pchanges.elevation;
						
						RideableUtils.TextPopUpID(pDocument.object ,"PreventedRiderMove", {pRiddenName : RideableFlags.RiddenToken(pDocument.object).name}); //MESSAGE POPUP
					}
					
					if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-moveridden") {	
						//move ridden and stop own movement
						let vRidden = RideableFlags.RiddenToken(vToken);
						
						if (vRidden) {
							if (vRidden.isOwner) {
								//can only change if you own vRidden
								
								let vxtarget = vRidden.x;								
								if (pchanges.x) {
									vxtarget = pchanges.x - (vRidden.w - pDocument.object.w)/2;
								}
								
								let vytarget = vRidden.y;
								if (pchanges.y) {
									vytarget = pchanges.y - (vRidden.h - pDocument.object.h)/2;
								}
								
								let vztarget = vRidden.document.elevation;		
								if (pchanges.elevation) {
									vztarget = pchanges.elevation - game.settings.get(cModuleName, "RidingHeight");
								}
								
								vRidden.document.update({x: vxtarget, y: vytarget, elevation: vztarget}, {animate : pInfos.animate});
							}
							
							delete pchanges.x;
							delete pchanges.y;
							delete pchanges.elevation;
						}
						//if a rider has no ridden Token something went wrong, better not do anything else
					}
					
					Hooks.call(cModuleName+".IndependentRiderMovement", vToken)
				}
			}
		}
	}
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {
		if (priddenToken) {
			if (RideableUtils.TokenisRideable(priddenToken) || pallFamiliars) {
				Ridingmanager.planRiderTokens(priddenToken, priddenToken.document, pRiderTokenList, pallFamiliars, pAnimations);
			}
		}
	} 
	
	static planRiderTokens(pRiddenToken, pUpdateDocument, pRiderTokenList, pallFamiliars = false, pAnimations = true) {
		let vRiderTokenList = pRiderTokenList;
		let vRiderFamiliarList = []; //List of Riders that Ride as familiars
		
		if (game.settings.get(cModuleName, "FamiliarRiding")) { 
		//split riders in familiars and normal riders
			if (pallFamiliars) {
				vRiderFamiliarList = vRiderTokenList;
			}
			else {
				vRiderFamiliarList = vRiderTokenList.filter(vToken => RideableFlags.isFamiliarRider(vToken));
				
				vRiderTokenList = vRiderTokenList.filter(vToken => !vRiderFamiliarList.includes(vToken));
			}
		}
		
		if (vRiderTokenList) {
			//calculate positioning data for riders (in y direction)
			let vbunchedRiders = true;
			let vxoffset = 0;
			let vxdelta = 0;
			
			if (cbetterRiderPositioning) {
				let vRiderWidthSumm = 0;
				let vlastRiderWidth = 0;
				
				for (let i = 0; i < vRiderTokenList.length; i++) {
					vRiderWidthSumm = vRiderWidthSumm + vRiderTokenList[i].w;
				}
				
				//if Riders have to be bunched
				if (vRiderWidthSumm > pRiddenToken.w) {
					vbunchedRiders = true;
					
					vxoffset = 0;
				
					if (vRiderTokenList.length > 1) {
						vxdelta = (pRiddenToken.w - vRiderTokenList[vRiderTokenList.length - 1].w)/(vRiderTokenList.length-1);
					}
				} 
				//if Riders dont have to be bunched
				else {
					vbunchedRiders = false;
					
					vxoffset = (pRiddenToken.w - vRiderWidthSumm)/2;
				
					vxdelta = 0; //every Rider has a custom delta, set higher for Rider seperation
				}
			}
			//place riders				
			Ridingmanager.placeRiderTokens(pUpdateDocument, vRiderTokenList, vxoffset, vxdelta, vbunchedRiders, pAnimations);
		}
		
		if (vRiderFamiliarList) {
			Ridingmanager.placeRiderTokenscorner(pUpdateDocument, vRiderFamiliarList, pAnimations);
		}
	}
	
	static placeRiderTokens(pUpdateDocument, pRiderTokenList, pxoffset, pxdelta, pbunchedRiders, pAnimations = true) {
		let vprex = 0;
		
		for (let i = 0; i < pRiderTokenList.length; i++) {
			//update riders position in x, y and z (only if not already on target position)		
			let vTargetx = 0;
			
			if (cbetterRiderPositioning) {
				if (pbunchedRiders) {
					vTargetx = pUpdateDocument.x + pxoffset + i*pxdelta;
				}
				else {
					if ((!pbunchedRiders) && (i > 0)) {
						vTargetx = vprex + pRiderTokenList[i-1].w;
						vprex = vTargetx;
					}
					else {
						vTargetx = pUpdateDocument.x + pxoffset
						vprex = vTargetx;
					}
				}
			}
			else {
				vTargetx = pUpdateDocument.x + pUpdateDocument.object.w/2 - pRiderTokenList[i].w/2;
			}
			
			let vTargety = pUpdateDocument.y + pUpdateDocument.object.h/2 - pRiderTokenList[i].h/2;
			
			let vTargetz = pUpdateDocument.elevation + game.settings.get(cModuleName, "RidingHeight");
			
			if ((pRiderTokenList[i].x != vTargetx) || (pRiderTokenList[i].y != vTargety)) {
				pRiderTokenList[i].document.update({x: vTargetx, y: vTargety}, {animate : pAnimations, RidingMovement : true});
			}
			
			if (pRiderTokenList[i].document.elevation != vTargetz) {
				pRiderTokenList[i].document.update({elevation: vTargetz}, {RidingMovement : true});
			}
			
		}
	}
	
	static placeRiderTokenscorner(pUpdateDocument, pRiderTokenList, pAnimations = true) {
		for (let i = 0; i < Math.min(Math.max(pRiderTokenList.length, cCornermaxRiders-1), pRiderTokenList.length); i++) { //no more then 4 corner places
			let vxoffset = pRiderTokenList[i].w/2;
			let vyoffset = pRiderTokenList[i].h/2;
			
			let vTargetx = 0;
			let vTargety = 0;
			
			switch (i) {
				case 0: //tl
					vTargetx = pUpdateDocument.x - vxoffset;
					vTargety = pUpdateDocument.y - vyoffset;
					break;
					
				case 1: //tr
					vTargetx = pUpdateDocument.x + pUpdateDocument.object.w - vxoffset;
					vTargety = pUpdateDocument.y - vyoffset;
					break;
					
				case 2: //bl
					vTargetx = pUpdateDocument.x - vxoffset;
					vTargety = pUpdateDocument.y + pUpdateDocument.object.h - vyoffset;
					break;
					
				case 3: //br
					vTargetx = pUpdateDocument.x + pUpdateDocument.object.w - vxoffset;
					vTargety = pUpdateDocument.y + pUpdateDocument.object.h - vyoffset;
					break;
			}
			
			let vTargetz = pUpdateDocument.elevation + game.settings.get(cModuleName, "RidingHeight");
			
			if ((pRiderTokenList[i].x != vTargetx) || (pRiderTokenList[i].y != vTargety)) {
				pRiderTokenList[i].document.update({x: vTargetx, y: vTargety}, {animate : pAnimations, RidingMovement : true});
			}
			
			if (pRiderTokenList[i].document.elevation != vTargetz) {
				pRiderTokenList[i].document.update({elevation: vTargetz}, {RidingMovement : true});
			}			
		}
	}
	
	static UnsetRidingHeight(pRiderTokens) {
		for (let i = 0; i < pRiderTokens.length; i++) {
			if (pRiderTokens[i] && pRiderTokens[i].document) {
				let vTargetz = pRiderTokens[i].document.elevation - game.settings.get(cModuleName, "RidingHeight");

				pRiderTokens[i].document.update({elevation: vTargetz}, {RidingMovement : true});
			}
		}
	}
}

//export

function UpdateRidderTokens(priddenToken, vRiderTokenList, pallFamiliars = false, pAnimations = true) {
	Ridingmanager.UpdateRidderTokens(priddenToken, vRiderTokenList, pallFamiliars, pAnimations);
}
function UnsetRidingHeight(pRiderTokens) {
	Ridingmanager.UnsetRidingHeight(pRiderTokens);
}

export { UpdateRidderTokens, UnsetRidingHeight };

//Set Hooks
Hooks.on("updateToken", (...args) => Ridingmanager.OnTokenupdate(...args));

Hooks.on("preUpdateToken", (...args) => Ridingmanager.OnTokenpreupdate(...args));
