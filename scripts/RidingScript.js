import { RideableFlags } from "./RideableFlags.js";
import { RideableUtils, cModuleName } from "./RideableUtils.js";

//CONSTANTS
const cbetterRiderPositioning = true; //for more complex positioning calculations

const cRidingEffectTokenImage = true; //set the Image of Riding effects to the Riding tokens image

//Ridingmanager will do all the work for placing riders
class Ridingmanager {
	//DECLARATIONS
	static OnTokenupdate(pDocument, pchanges, pInfos) {} //calculates which Tokens are Riders of priddenToken und places them on it
	
	static OnTokenpreupdate(pDocument, pchanges, pInfos) {} //Handles atempted movement of Riders
	
	static UpdateRidderTokens(priddenToken, vRiderTokenList) {} //Works out where the Riders of a given token should be placed and calls placeRiderTokens to apply updates
	
	static planRiderTokens(pRiddenToken, pUpdateDocument, pRiderTokenList) {} //Works out where the Riders of pRiddenToken should move based on the updated pRiddenDocument and executes placeRiderTokens
	
	static placeRiderTokens(priddenToken, pRiderTokenList, pxoffset, pxdelta, pbunchedRiders) {} //Set the Riders(pRiderTokenList) token based on the Inputs (pxoffset, pxdelta, pbunchedRiders) und the position of priddenToken
	
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
					
					Ridingmanager.planRiderTokens(vToken, pDocument, vRiderTokenList);
				}
			}
		}
	}
	
	static OnTokenpreupdate(pDocument, pchanges, pInfos) {
		//Check if Token is Rider
		let vToken = pDocument.object;
		if (RideableFlags.isRider(vToken)) {
			if (!pInfos.RidingMovement) {
				if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow") {	
					delete pchanges.x;
					delete pchanges.y;
					delete pchanges.elevation;
				}
				
				Hooks.call(cModuleName+".IndependentRiderMovement", vToken)
			}
		}
	}
	
	static UpdateRidderTokens(priddenToken, vRiderTokenList) {
		if (priddenToken) {
			if (RideableUtils.TokenisRideable(priddenToken)) {
				Ridingmanager.planRiderTokens(priddenToken, priddenToken.document, vRiderTokenList);
			}
		}
	} 
	
	static planRiderTokens(pRiddenToken, pUpdateDocument, pRiderTokenList) {
		//Get Rider Tokens and continue if at least one was found
		if (pRiderTokenList) {
			//calculate positioning data for riders (in y direction)
			let vbunchedRiders = true;
			let vxoffset = 0;
			let vxdelta = 0;
			
			if (cbetterRiderPositioning) {
				let vRiderWidthSumm = 0;
				let vlastRiderWidth = 0;
				
				for (let i = 0; i < pRiderTokenList.length; i++) {
					vRiderWidthSumm = vRiderWidthSumm + pRiderTokenList[i].w;
				}
				
				//if Riders have to be bunched
				if (vRiderWidthSumm > pRiddenToken.w) {
					vbunchedRiders = true;
					
					vxoffset = pRiderTokenList[0].w/2;
				
					if (pRiderTokenList.length > 1) {
						vxdelta = (pRiddenToken.w - pRiderTokenList[pRiderTokenList.length - 1].w)/(pRiderTokenList.length-1);
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
			Ridingmanager.placeRiderTokens(pUpdateDocument, pRiderTokenList, vxoffset, vxdelta, vbunchedRiders);
		}
	}
	
	static placeRiderTokens(pUpdateDocument, pRiderTokenList, pxoffset, pxdelta, pbunchedRiders) {
		for (let i = 0; i < pRiderTokenList.length; i++) {
			
			//update riders position in x, y and z (only if not already on target position)
			
			let vTargetx = 0;
			if (cbetterRiderPositioning) {
				vTargetx = pUpdateDocument.x + pxoffset + (i-1)*pxdelta;
					
				if ((!pbunchedRiders) && (i > 0)) {
					vTargetx = vTargetx + (pRiderTokenList[i].w + pRiderTokenList[i-1].w)/2;
				}
			}
			else {
				vTargetx = pUpdateDocument.x + pUpdateDocument.object.w/2 - pRiderTokenList[i].w/2;
			}
			
			let vTargety = pUpdateDocument.y + pUpdateDocument.object.h/2 - pRiderTokenList[i].h/2;
			
			let vTargetz = pUpdateDocument.elevation + game.settings.get(cModuleName, "RidingHeight");
			
			if ((pRiderTokenList[i].x != vTargetx) || (pRiderTokenList[i].y != vTargety)) {
				pRiderTokenList[i].document.update({x: vTargetx, y: vTargety}, {RidingMovement : true});
			}
			
			if (pRiderTokenList[i].document.elevation != vTargetz) {
				pRiderTokenList[i].document.update({elevation: vTargetz});
			}
			
		}
	}
	
	static UnsetRidingHeight(pRiderTokens) {
		for (let i = 0; i < pRiderTokens.length; i++) {
			if (pRiderTokens[i]) {
				let vTargetz = pRiderTokens[i].document.elevation - game.settings.get(cModuleName, "RidingHeight");

				pRiderTokens[i].document.update({elevation: vTargetz}, {RidingMovement : true});
			}
		}
	}
}

//export

function UpdateRidderTokens(priddenToken, vRiderTokenList) {
	Ridingmanager.UpdateRidderTokens(priddenToken, vRiderTokenList);
}
function UnsetRidingHeight(pRiderTokens) {
	Ridingmanager.UnsetRidingHeight(pRiderTokens);
}

export { UpdateRidderTokens, UnsetRidingHeight };

//Set Hooks
Hooks.on("updateToken", (...args) => Ridingmanager.OnTokenupdate(...args));

Hooks.on("preUpdateToken", (...args) => Ridingmanager.OnTokenpreupdate(...args));
