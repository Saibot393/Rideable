import { RideableFlags, cCornermaxRiders } from "./RideableFlags.js";
import { RideableUtils, cModuleName } from "./RideableUtils.js";
import { RideablePopups } from "./RideablePopups.js";
import { GeometricUtils } from "./GeometricUtils.js";

//Ridingmanager will do all the work for placing riders and handling the z-Height
class Ridingmanager {
	//DECLARATIONS
	static OnTokenupdate(pToken, pchanges, pInfos) {} //calculates which Tokens are Riders of priddenToken und places them on it
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {} //Works out if Rider has moved independently
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //Works out where the Riders of a given token should be placed and calls placeRiderTokens to apply updates
	
	static OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {} //Handles what should happen if a rider moved independently
	
	static planRiderTokens(pRiddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //Works out where the Riders of pRiddenToken should move based on the updated pRiddenToken
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //works out the position of tokens if they are spread according to a set pattern
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList) {} //sets the appropiate riding height (elevation) of pRiderTokenList based on pRiddenToken
	
	static placeRelativRiderTokens(pRiddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {} //works out the position of tokens if they can move freely on pRiddenToken
	
	static placeRiderTokensPattern(priddenToken, pRiderTokenList, pxoffset, pxdelta, pallFamiliars = false, pAnimations = true) {} //Set the Riders(pRiderTokenList) token based on the Inputs (pxoffset, pxdelta, pbunchedRiders) und the position of priddenToken
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true) {} //places up to four tokens from pRiderTokenList on the corners of priddenToken
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pAnimation = true) {} //places pRider on pRidden using the pTargetx, pTargetx relativ to pRidden center position and rotates them is enabled
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {} //Reduces Tokens Elevation by Riding height or sets it to the height of the previously ridden token
	
	//IMPLEMENTATIONS
	static OnTokenupdate(pToken, pchanges, pInfos) {
		if (game.user.isGM) {
			
			if (!pToken) {
				//get token from scene if not linked
				RideableUtils.TokenfromID(pToken.id, pToken.scene)
			}
			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(pToken)) {
				//check if token position was actually changed
				if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"))) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), pToken.scene);
					
					Ridingmanager.planRiderTokens(pToken, vRiderTokenList, false, pInfos.animate);
				}
			}
		}
	}
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {
		//Check if Token is Rider
		if (RideableFlags.isRider(pToken)) {
			if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"))) {
				if (!pInfos.RidingMovement) {
					let vRidden = RideableFlags.RiddenToken(pToken);
					let vRiderLeft = true;
					
					if (RideableFlags.RiderscanMoveWithin(vRidden) && !RideableFlags.isFamiliarRider(pToken)) {
						let vNewPosition = GeometricUtils.NewCenterPosition(pToken, pchanges);
						
						if (GeometricUtils.withinBoundaries(vRidden, RideableFlags.TokenForm(vRidden), vNewPosition)) {
							vRiderLeft = false;
							
							//update relativ position of Rider
							RideableFlags.setRelativPosition(pToken, GeometricUtils.Rotated(GeometricUtils.Difference(vNewPosition, GeometricUtils.CenterPosition(vRidden)), -vRidden.rotation));
						}
					}
					
					if (vRiderLeft) {
						Ridingmanager.OnIndependentRidermovement(pToken, pchanges, pInfos, vRidden, psendingUser);
					}
				}
			}
		}
	}
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {
		if (priddenToken) {
			Ridingmanager.planRiderTokens(priddenToken, pRiderTokenList, pallFamiliars, pAnimations);
		}
	} 
	
	static OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {
		let vGMoverride = false;
					
		if (psendingUser.isGM) {
			if ((!pchanges.hasOwnProperty("x") && !pchanges.hasOwnProperty("y") && pchanges.hasOwnProperty("elevation")) && !(game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-moveridden")) {
				//if a dm tried to only change the elevation while "move ridden" is off
				vGMoverride = true;
				
				RideableFlags.setRiderHeight(pToken, RideableFlags.RiderHeight(pToken) + (pchanges.elevation - pToken.elevation));
			}
		}
		
		if (!vGMoverride) {
			let vdeleteChanges = false;
			
			if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow") {	
				//suppress movement
				vdeleteChanges = true;
				
				RideablePopups.TextPopUpID(pToken ,"PreventedRiderMove", {pRiddenName : RideableFlags.RiddenToken(pToken).name}); //MESSAGE POPUP
			}
			
			if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-moveridden") {	
				//move ridden and stop own movement		
				if (pRidden) {
					if (pRidden.isOwner) {
						//can only change if you own vRidden
						
						let vxtarget = pRidden.x;								
						if (pchanges.hasOwnProperty("x")) {
							vxtarget = pRidden.x + (pchanges.x - pToken.x);
						}
						
						let vytarget = pRidden.y;
						if (pchanges.hasOwnProperty("y")) {
							vytarget = pRidden.y + (pchanges.y - pToken.y);
						}
						
						let vztarget = pRidden.elevation;		
						if (pchanges.hasOwnProperty("elevation")) {
							vztarget = pchanges.elevation - RideableUtils.Ridingheight(pRidden) - RideableFlags.RiderHeight(pToken);
						}
						
						let vrotationtarget = pRidden.rotation;	
						if (game.settings.get(cModuleName, "RiderRotation")) {
							vrotationtarget = pchanges.rotation;
						}
						
						pRidden.update({x: vxtarget, y: vytarget, elevation: vztarget, rotation: vrotationtarget}, {animate : pInfos.animate});
					}
					
					vdeleteChanges = true;
				}
				//if a rider has no ridden Token something went wrong, better not do anything else
			}
		
			if (vdeleteChanges) {
				delete pchanges.x;
				delete pchanges.y;
				delete pchanges.elevation;
				delete pchanges.rotation;
			}
			
			Hooks.call(cModuleName+".IndependentRiderMovement", pToken, pchanges)
		}
	}
	
	static planRiderTokens(pRiddenToken, pRiderTokenList, pallFamiliars = false, pAnimations = true) {
		let vRiderTokenList = pRiderTokenList;
		let vRiderFamiliarList = []; //List of Riders that Ride as familiars	
		
		//Take care of ridr height
		Ridingmanager.placeRiderHeight(pRiddenToken, pRiderTokenList);
		
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
    
		if (RideableFlags.RiderscanMoveWithin(pRiddenToken)) {
			Ridingmanager.planRelativRiderTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		else {
			Ridingmanager.planPatternRidersTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		
		Ridingmanager.placeRiderTokenscorner(pRiddenToken, vRiderFamiliarList, pAnimations);
	}
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		if (pRiderTokenList.length) {
			let vbunchedRiders = true;
			let vxoffset = 0;
			let vxdelta = 0;
			
			let vRiderWidthSumm = 0;
			
			for (let i = 0; i < pRiderTokenList.length; i++) {
				vRiderWidthSumm = vRiderWidthSumm + GeometricUtils.insceneWidth(pRiderTokenList[i]);
			}
			
			//if Riders have to be bunched
			if (vRiderWidthSumm > GeometricUtils.insceneWidth(pRiddenToken)) {
				vbunchedRiders = true;
				
				vxoffset = -GeometricUtils.insceneWidth(pRiddenToken)/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;
			
				if (pRiderTokenList.length > 1) {
					vxdelta = (GeometricUtils.insceneWidth(pRiddenToken) - (GeometricUtils.insceneWidth(pRiderTokenList[vRiderTokenList.length - 1]) + GeometricUtils.insceneWidth(pRiderTokenList[0]))/2)/(pRiderTokenList.length-1);
				}
			} 
			//if Riders dont have to be bunched
			else {
				vbunchedRiders = false;
				
				vxoffset = -vRiderWidthSumm/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;
			
				vxdelta = 0; //every Rider has a custom delta, set higher for Rider seperation
			}
			//place riders				
			Ridingmanager.placeRiderTokensPattern(pRiddenToken, pRiderTokenList, vxoffset, vxdelta, vbunchedRiders, pAnimations);
		}
	} 
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList) {
		for (let i = 0; i < pRiderTokenList.length; i++) {
			
			let vTargetz = pRiddenToken.elevation + RideableUtils.Ridingheight(pRiddenToken)/*game.settings.get(cModuleName, "RidingHeight")*/ + RideableFlags.RiderHeight(pRiderTokenList[i]);
				
			if (pRiderTokenList[i].elevation != vTargetz) {
				pRiderTokenList[i].update({elevation: vTargetz}, {RidingMovement : true});
			}	
		}
	}
	
	static planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		let vRiddenForm = RideableFlags.TokenForm(pRiddenToken);
		
		for (let i = 0; i < pRiderTokenList.length; i++) {
			let vTargetPosition = RideableFlags.RelativPosition(pRiderTokenList[i]);
			
			
			if (!RideableFlags.HasrelativPosition(pRiderTokenList[i])) {
				//if first time Rider give Border position
				vTargetPosition = GeometricUtils.closestBorderposition(pRiddenToken, vRiddenForm, GeometricUtils.TokenDifference(pRiderTokenList[i], pRiddenToken));
				RideableFlags.setRelativPosition(pRiderTokenList[i], vTargetPosition);
			}
			
			Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetPosition[0], vTargetPosition[1], pAnimations);		
		}
	}
	
	static placeRiderTokensPattern(pRiddenToken, pRiderTokenList, pxoffset, pxdelta, pbunchedRiders, pAnimations = true) {
		let vprex = 0;
		
		for (let i = 0; i < pRiderTokenList.length; i++) {
			//update riders position in x, y and z (only if not already on target position)		
			let vTargetx = 0;
			let vTargety = 0;
			
			if (pbunchedRiders) {
				vTargetx = pxoffset + i*pxdelta;
			}
			else {
				if (i > 0) {
					vTargetx = vprex + (GeometricUtils.insceneWidth(pRiderTokenList[i-1])+GeometricUtils.insceneWidth(pRiderTokenList[i]))/2;
					vprex = vTargetx;
				}
				else {
					vTargetx = pxoffset;
					vprex = vTargetx;
				}
			}
			
			Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, pAnimations);		
		}
	}
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true) {
		if (pRiderTokenList.length) {
			for (let i = 0; i < Math.min(Math.max(pRiderTokenList.length, cCornermaxRiders-1), pRiderTokenList.length); i++) { //no more then 4 corner places			
				let vTargetx = 0;
				let vTargety = 0;
				
				switch (i) {
					case 0: //tl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 1: //tr
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 2: //bl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 3: //br
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
				}
				
				Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, pAnimations);		
			}
		}
	}
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pAnimation = true) {	
		let vTargetx = pTargetx;
		let vTargety = pTargety;
		
		if (game.settings.get(cModuleName, "RiderRotation")) {
			//rotation
			[vTargetx, vTargety] = GeometricUtils.Rotated([pTargetx, pTargety], pRiddenToken.rotation);
			
			pRider.update({rotation: pRiddenToken.rotation}, {animate : pAnimation, RidingMovement : true});
		}
		
		vTargetx = pRiddenToken.x + GeometricUtils.insceneWidth(pRiddenToken)/2 - GeometricUtils.insceneWidth(pRider)/2 + vTargetx;
		vTargety = pRiddenToken.y + GeometricUtils.insceneHeight(pRiddenToken)/2 - GeometricUtils.insceneHeight(pRider)/2 + vTargety;
			
		if ((pRider.x != vTargetx) || (pRider.y != vTargety)) {
			pRider.update({x: vTargetx, y: vTargety}, {animate : pAnimation, RidingMovement : true});
		}
	}
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
		for (let i = 0; i < pRiderTokens.length; i++) {
			if (pRiderTokens[i] && pRiderTokens[i]) {
				let vTargetz = 0;
				
				if (pRiddenTokens[i]) {
					//set to height or previously ridden token
					vTargetz = pRiddenTokens[i].elevation;
				}
				else {
					//reduce height by riding height
					vTargetz = pRiderTokens[i].elevation - RideableUtils.Ridingheight();
				} 

				pRiderTokens[i].update({elevation: vTargetz}, {RidingMovement : true});
			}
		}
	}
}

//export

function UpdateRidderTokens(priddenToken, vRiderTokenList, pallFamiliars = false, pAnimations = true) {
	Ridingmanager.UpdateRidderTokens(priddenToken, vRiderTokenList, pallFamiliars, pAnimations);
}
function UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
	Ridingmanager.UnsetRidingHeight(pRiderTokens, pRiddenTokens);
}

export { UpdateRidderTokens, UnsetRidingHeight };

//Set Hooks
Hooks.on("updateToken", (...args) => Ridingmanager.OnTokenupdate(...args));

Hooks.on("preUpdateToken", (...args) => Ridingmanager.OnTokenpreupdate(...args));
