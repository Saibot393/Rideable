import * as FCore from "./CoreVersionComp.js";

import { RideableFlags, cCornermaxRiders } from "./helpers/RideableFlags.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";
import { GeometricUtils, cGradtoRad } from "./utils/GeometricUtils.js";
import { calculatenewRoute } from "./FollowingScript.js";

//positioning options
const cRowplacement = "RowPlacement"; //place all tokens in a RowPlacement
const cColumnplacement = "ColumnPlacement"; //place all tokens in a column
const cCircleplacement = "CirclePlacement"; //place all tokens in a circle
const cBlockplacement = "BlockPlacement"; //place all tokens in a Block
const cClusterplacement = "ClusterPlacement"; //place all tokens in a Cluster
const cRowplacementTop = "RowPlacementTop"; //place all tokens in a row at the top of the ridden
const cRowplacementBottom = "RowPlacementBottom"; //place all tokens in a row at the bottom of the ridden
const cCornerPlacement = "CornerPlacement"; //places all tokens at the corners
const cCornerPlacementinner = "CornerPlacementinner"; //places all tokens at corners INSIDE of rider
const cMountPosition = "MountPosition"; //places token at the position they mounted

const cupkeys = new Set(["KeyW", "ArrowUp", "Numpad7", "Numpad8", "Numpad9"]);
const cdownkeys = new Set(["KeyS", "ArrowDown", "Numpad1", "Numpad2", "Numpad3"]);
const cleftkeys = new Set(["KeyA", "ArrowLeft", "Numpad1", "Numpad4", "Numpad7"]);
const crightkeys = new Set(["KeyD", "ArrowRight", "Numpad3", "Numpad6", "Numpad9"]);

//grapple positioning options
const cRowBelow = "RowBelow"; //places grappled tokens below
const cRowAbove = "RowAbove"; //places grappled tokens above
const cRowMiddle = "RowMiddle"; //place grappled tokens in middle
const cClosestInside = "ClosestInside"; //place grappled tokens at the closest Inside position
const cFollowing = "Following";

const cPlacementPatterns = [cRowplacement, cCircleplacement, cBlockplacement, cClusterplacement, cRowplacementTop, cRowplacementBottom, cCornerPlacement, cCornerPlacementinner, cMountPosition];

const cGrapplePlacements = [cRowBelow, cRowAbove, cRowMiddle, cClosestInside, cFollowing]

export { cRowplacement, cPlacementPatterns, cGrapplePlacements };

const cSizeFactor = 2/3;

const cSortDifference = 10; //sort difference between ridden and rider

const cMotionProperties = ["x", "y", "rotation", "elevation"]; //collection of valied motion key words

//Ridingmanager will do all the work for placing riders and handling the z-Height
class Ridingmanager {
	//DECLARATIONS
	static OnTokenupdate(pToken, pchanges, pInfos, pID, pisTile = false) {} //calculates which Tokens are Riders of priddenToken und places them on it
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {} //Works out if Rider has moved independently
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList = [], pAnimations = true) {} //Works out where the Riders of a given token should be placed and calls placeRiderTokens to apply updates
	
	static async OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {} //Handles what should happen if a rider moved independently
	
	static async planRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //Works out where the Riders of pRiddenToken should move based on the updated pRiddenToken
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //works out the position of tokens if they are spread according to a set pattern
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList, pPlaceSameheight = false) {} //sets the appropiate riding height (elevation) of pRiderTokenList based on pRiddenToken
	
	static async fitRiders(pRiddenToken, pRiderTokenList, pSizeFactor = cSizeFactor) {} //reduces the size of all tokens that are equal or greater in size to their ridden token to pSizeFactor of ridden token
	
	static planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //works out the position of tokens if they can move freely on pRiddenToken
	
	//DEPRICATED:
	//static placeRiderTokensPattern(priddenToken, pRiderTokenList, pxoffset, pxdelta, pallFamiliars = false, pAnimations = true) {} //Set the Riders(pRiderTokenList) token based on the Inputs (pxoffset, pxdelta, pbunchedRiders) und the position of priddenToken
	
	static placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations = true, pyoffset = []) {} //works out the position of tokens if they are spread according in a row
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true, pInner = false) {} //places up to four tokens from pRiderTokenList on the corners of priddenToken
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pRelativerotation = 0, pAnimation = true) {} //places pRider on pRidden using the pTargetx, pTargetx relativ to pRidden center position and rotates them is enabled
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {} //Reduces Tokens Elevation by Riding height or sets it to the height of the previously ridden token
	
	//sort
	static SyncSort(pDocument, pSort, pInfos = {}) {} //requests all clients to synch sort value of pDocument only GM
	
	static SyncSortRequest(pData) {} //answers a requests a sort sync
	
	//external movement
	static MoveRiddenGM(pRidden, pRelativChanges, pInfos) {} //change the position of a riden token as a GM
	
	static RequestMoveRidden(pRidden, pRelativChanges, pInfos) {} //request the position change of a Ridden token from the GM
	
	static MoveRiddenRequest(pRiddenID, pSceneID, pRelativChanges, pInfos) {} //answers a request to move a ridden token 
	
	//support
	static MovementDelta(pToken, pchanges) {} //returns the movement delta (x,y,rotation,elevation) of pToken with pchanges
	
	static keydownMoveReplacement() {} //returns an xy replacement incase movement keys are down
	
	//IMPLEMENTATIONS
	static OnTokenupdate(pToken, pchanges, pInfos, pID, pisTile = false) {
		if (game.user.isGM) {
			
			/*
			if (!pToken) {
				//get token from scene if not linked
				RideableUtils.TokenfromID(pToken.id, FCore.sceneof(pToken))
			}
			*/
			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(pToken)) {
				//check if token position was actually changed
				if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"))) {
					//check if ridden Token exists
					let vRiderTokenList = RideableFlags.RiderTokens(pToken);
					
					Ridingmanager.planRiderTokens(pToken, vRiderTokenList, !pisTile && pInfos.animate);
				}
			}
		}
	}
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {
		//Check if Token is Rider
		if (RideableFlags.isRider(pToken)) {
			let vPositionChange = pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"));
			let vElevationChange = pchanges.hasOwnProperty("elevation");
			
			if (vPositionChange || vElevationChange) {
				if (!pInfos.RidingMovement) {
					let vRidden = RideableFlags.RiddenToken(pToken);
					
					let vDeleteChanges = false;
					
					if (RideableFlags.isPilotedby(vRidden, pToken)) {
						vDeleteChanges = true;
						
						let vRelativChanges = {...Ridingmanager.MovementDelta(pToken, pchanges), ...Ridingmanager.keydownMoveReplacement()};
						/*
						for (let i = 0; i < cMotionProperties.length; i++) {
							if (pchanges.hasOwnProperty(cMotionProperties[i])) {
								vRelativChanges[cMotionProperties[i]] = pchanges[cMotionProperties[i]] - pToken[cMotionProperties[i]];
							}
						}
						*/
												
						Ridingmanager.RequestMoveRidden(vRidden, vRelativChanges, {MovedbyPilot : true, PilotID : pToken.id});
					}
					else {
						let vindependentRiderLeft = true;
						
						if (RideableFlags.RiderscanMoveWithin(vRidden) && !RideableFlags.isFamiliarRider(pToken) && !RideableFlags.isGrappled(pToken)) {
							if (RideableFlags.hasPositionLock(pToken)) {
								//apply position lock
								delete pchanges.x;
								delete pchanges.y;
								delete pchanges.elevation;
							}
							
							let vNewPosition = GeometricUtils.NewCenterPosition(pToken, pchanges);
							
							if (GeometricUtils.withinBoundaries(vRidden, RideableFlags.TokenForm(vRidden), vNewPosition)) {
								vindependentRiderLeft = false;
								
								if (vPositionChange) {
									//update relativ position of Rider
									let vnewRotation = pchanges.hasOwnProperty("rotation") ? pchanges.rotation : pToken.rotation;
									

									RideableFlags.setRelativPosition(pToken, [...(GeometricUtils.Rotated(GeometricUtils.Difference(vNewPosition, GeometricUtils.CenterPosition(vRidden)), -vRidden.rotation)), vnewRotation - vRidden.rotation]);
								}
								
								if (vElevationChange) {
									//update relative elevation of Rider
									RideableFlags.setaddRiderHeight(pToken, RideableFlags.addRiderHeight(pToken) + (pchanges.elevation - pToken.elevation));
								}
							}
						}
						
						if (RideableFlags.isGrappled(pToken)) {
							vindependentRiderLeft = false;
					
							vDeleteChanges = true;
							
							RideablePopups.TextPopUpID(pToken ,"PreventedGrappledMove", {pRiddenName : RideableFlags.RideableName(RideableFlags.RiddenToken(pToken))}); //MESSAGE POPUP
						}
						
						if (vindependentRiderLeft) {
							Ridingmanager.OnIndependentRidermovement(pToken, pchanges, pInfos, vRidden, psendingUser);
						}
					}
					
					if (vDeleteChanges) {
						delete pchanges.x;
						delete pchanges.y;
						
						if (RideableFlags.UseRidingHeight(vRidden)) {
							delete pchanges.elevation;
						}
						
						if (game.settings.get(cModuleName, "RiderRotation")) {
							delete pchanges.rotation;
						}
					}
				}
			}
		}
	}
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList = [], pAnimations = true) {
		if (priddenToken) {
			if (pRiderTokenList.length > 0) {
				Ridingmanager.planRiderTokens(priddenToken, pRiderTokenList, pAnimations);
			}
			else {
				let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(priddenToken), FCore.sceneof(priddenToken));
					
				Ridingmanager.planRiderTokens(priddenToken, vRiderTokenList, false);
			}
		}
	} 
	
	static async OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {
		let vElevationOverride = false; //option to override standard behaviour if only the elevation was changed
					
		if (game.users.get(psendingUser).isGM) {
			if ((!pchanges.hasOwnProperty("x") && !pchanges.hasOwnProperty("y") && pchanges.hasOwnProperty("elevation")) && !(RideableUtils.getRiderMovementsetting() === "RiderMovement-moveridden")) {
				//if a dm tried to only change the elevation while "move ridden" is off
				vElevationOverride = true;
				
				RideableFlags.setaddRiderHeight(pToken, RideableFlags.addRiderHeight(pToken) + (pchanges.elevation - pToken.elevation));
			}
		}
		
		if (!vElevationOverride) {
			let vdeleteChanges = false;
			
			
			if ((RideableUtils.getRiderMovementsetting() === "RiderMovement-disallow")) {
				vdeleteChanges = true;
				
				if (RideableFlags.RiderscanMoveWithin(pRidden)) {
					//move to closest border position
					let vTargetPosition = GeometricUtils.closestBorderposition(pRidden, RideableFlags.TokenForm(pRidden), pToken, RideableUtils.CompleteProperties(["x","y","rotation"], pchanges, pToken));

					vTargetPosition = [...(GeometricUtils.GridSnap(vTargetPosition, FCore.sceneof(pRidden).grid, [(pRidden.width+pToken.width)%2,(pRidden.height+pToken.height)%2])),vTargetPosition.rotation - pRidden.rotation];

					await RideableFlags.setRelativPosition(pToken, vTargetPosition);
					
					Ridingmanager.UpdateRidderTokens(pRidden, [pToken]);
				}
				else {
					//suppress movement
					RideablePopups.TextPopUpID(pToken ,"PreventedRiderMove", {pRiddenName : RideableFlags.RideableName(RideableFlags.RiddenToken(pToken))}); //MESSAGE POPUP
				}
			}
			
			if (RideableUtils.getRiderMovementsetting() === "RiderMovement-moveridden") {	
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

						if (!isFinite(vztarget)) {
							vztarget = 0;
						}
						
						if (pchanges.hasOwnProperty("elevation")) {
							vztarget = pchanges.elevation - RideableUtils.Ridingheight(pRidden) - RideableFlags.addRiderHeight(pToken);
						}
						
						let vrotationtarget = pRidden.rotation;	
						if (game.settings.get(cModuleName, "RiderRotation")) {
							vrotationtarget = pchanges.rotation;
						}
						
						[vxtarget, vytarget] = GeometricUtils.GridSnap([vxtarget, vytarget], FCore.sceneof(pRidden).grid);
						
						pRidden.update({x: vxtarget, y: vytarget, elevation: vztarget, rotation: vrotationtarget}, {animate : pInfos.animate});
					}
					
					vdeleteChanges = true;
				}
				//if a rider has no ridden Token something went wrong, better not do anything else
			}
		
			if (vdeleteChanges) {
				delete pchanges.x;
				delete pchanges.y;
				
				if (RideableFlags.UseRidingHeight(pRidden)) {
					delete pchanges.elevation;
				}
				
				delete pchanges.rotation;
			}
			
			Hooks.call(cModuleName+".IndependentRiderMovement", pToken, pchanges)
		}
	}
	
	static async planRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		let vRiderTokenList = pRiderTokenList;
		let vRiderFamiliarList = []; //List of Riders that Ride as familiars	
		let vGrappledList = [];
		
		if (game.settings.get(cModuleName, "Grappling")) { 
			vGrappledList = vRiderTokenList.filter(vToken => RideableFlags.isGrappled(vToken));
			
			vRiderTokenList = vRiderTokenList.filter(vToken => !vGrappledList.includes(vToken));
		}
		
		//Take care of rider height
		Ridingmanager.placeRiderHeight(pRiddenToken, vRiderTokenList);
		Ridingmanager.placeRiderHeight(pRiddenToken, vGrappledList, true);
		
		if (game.settings.get(cModuleName, "FamiliarRiding")) { 
		//split riders in familiars and normal riders
			vRiderFamiliarList = vRiderTokenList.filter(vToken => RideableFlags.isFamiliarRider(vToken));
				
			vRiderTokenList = vRiderTokenList.filter(vToken => !vRiderFamiliarList.includes(vToken));
		}
		
		//reduce size if necessary
		if (game.settings.get(cModuleName, "FitRidersize")) {
			await Ridingmanager.fitRiders(pRiddenToken, vRiderTokenList, game.settings.get(cModuleName, "FitRiderSizeFactor"));
		}
    
		if (RideableFlags.RiderscanMoveWithin(pRiddenToken)) {
			Ridingmanager.planRelativRiderTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		else {
			Ridingmanager.planPatternRidersTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		
		//Familiars
		Ridingmanager.placeRiderTokenscorner(pRiddenToken, vRiderFamiliarList, pAnimations);
		
		//Grappled
		switch (RideableFlags.GrapplePlacement(pRiddenToken)) {
			case cRowAbove:
				Ridingmanager.placeRidersTokensRow(pRiddenToken, vGrappledList, pAnimations, vGrappledList.map(vToken => (-GeometricUtils.insceneHeight(vToken)-GeometricUtils.insceneHeight(pRiddenToken))/2));
				break;
			case cRowMiddle:
				Ridingmanager.placeRidersTokensRow(pRiddenToken, vGrappledList, pAnimations, vGrappledList.map(vToken => (0)));
				break;
			case cClosestInside:
				Ridingmanager.planRelativRiderTokens(pRiddenToken, vGrappledList, pAnimations);
				break;
			case cFollowing:
				calculatenewRoute(vGrappledList, {StartRoute : true, Distance : Math.max(pRiddenToken.width, pRiddenToken.height) * pRiddenToken.parent.dimensions.distance, Target : pRiddenToken, Scene : pRiddenToken.parent, RidingMovement : true});
				break;
			default:
				Ridingmanager.placeRidersTokensRow(pRiddenToken, vGrappledList, pAnimations, vGrappledList.map(vToken => (GeometricUtils.insceneHeight(vToken)+GeometricUtils.insceneHeight(pRiddenToken))/2));
		}
	}
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		if (pRiderTokenList.length) {
			let vAngleSteps; //to fix javascript syntax bug
			
			switch (RideableFlags.RiderPositioning(pRiddenToken)) {
				case cCircleplacement:
					vAngleSteps = 360/pRiderTokenList.length;
					
					//calculate maximum placement heights and widths
					let vMaxHeight = 0;
					let vMaxWidth = 0;
					
					for (let i = 0; i < pRiderTokenList.length; i++) {
						vMaxHeight = Math.max(vMaxHeight, GeometricUtils.insceneHeight(pRiderTokenList[i]));
						vMaxWidth = Math.max(vMaxWidth, GeometricUtils.insceneWidth(pRiderTokenList[i]));
					}
					
					vMaxHeight = (GeometricUtils.insceneHeight(pRiddenToken) - vMaxHeight)/2;
					vMaxWidth = (GeometricUtils.insceneWidth(pRiddenToken) - vMaxWidth)/2;
					
					for (let i = 0; i < pRiderTokenList.length; i++) {
						Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vMaxWidth * Math.sin(vAngleSteps*cGradtoRad*i), -vMaxHeight * Math.cos(vAngleSteps*cGradtoRad*i), 0, pAnimations);
					}	
					
					break;
				case cBlockplacement:
					const cSizeFactor = FCore.sceneof(pRiddenToken).dimensions.size/2;
										
					let vxsize; 
					let vysize;
					
					switch (pRiddenToken.documentName) {
						case "Token":
							vxsize = Math.round(pRiddenToken.width * 2);
							vysize = Math.round(pRiddenToken.height * 2);
							break;
						case "Tile":
							vxsize = Math.round(pRiddenToken.width / cSizeFactor);
							vysize = Math.round(pRiddenToken.height / cSizeFactor);
							break;
					}
					
					let vplanningMatrix = [];
					
					for (let x = 0; x < vxsize; x++) {
						vplanningMatrix[x] = [];
						for (let y = 0; y < vysize; y++) {
							vplanningMatrix[x][y] = true;
						}
					}
					
					function useSpace(vpositionx, vpositiony, vwidth, vheight) {
						for (let x = vpositionx; x < Math.min(vxsize, vpositionx + vwidth); x++) {
							for (let y = vpositiony; y < Math.min(vysize, vpositiony + vheight); y++) {
								vplanningMatrix[x][y] = false;
							}
						}
					}
					
					function searchfreeSpace(vwidth, vheight) {	
						//clean search for fit
						let vx = 0;
						let vy = 0;
						while (vy <= vysize-vheight) {						
							vx = 0;
							while (vx <= vxsize-vwidth) {							
								let vfoundbuffer = true;
								
								let vrelativey = 0;
								while (vfoundbuffer && vrelativey < vheight) {
									let vrelativex = 0;
									while (vfoundbuffer && vrelativex < vwidth) {
										vfoundbuffer = vfoundbuffer && vplanningMatrix[vx + vrelativex][vy + vrelativey];
										
										vrelativex = vrelativex + 1;
									}
									vrelativey = vrelativey + 1;
								}
								
								if (vfoundbuffer) {
									return [vx, vy];
								}
								
								vx = vx + 1;
							}
							vy = vy + 1;
						}
						
						//no adequate space left, take whats left
						vx = 0;
						vy = 0;
						while (vy < vysize) {						
							vx = 0;
							while (vx < vxsize) {								
								if (vplanningMatrix[vx][vy]) {
									return [vx, vy];
								};
								
								vx = vx + 1;
							}
							vy = vy + 1;
						}
						
						//houston we have a problem
					}
					
					let vsortedRiders = pRiderTokenList.sort((a,b) => {return (a.height * a.width) - (b.height * b.width)}).reverse();
					
					const cxOffset = -GeometricUtils.insceneWidth(pRiddenToken)/2;
					const cyOffset = -GeometricUtils.insceneHeight(pRiddenToken)/2;
					
					for (const vrider of vsortedRiders) {
						let vtargetposition = searchfreeSpace(vrider.width * 2, vrider.height * 2);
						
						if (!vtargetposition) {
							vtargetposition = [0,0]; //fallback
						}
						
						useSpace(vtargetposition[0], vtargetposition[1], vrider.width * 2, vrider.height * 2);
						
						let vTargetx = cxOffset + (vtargetposition[0] + vrider.width) * cSizeFactor;
						let vTargety = cyOffset + (vtargetposition[1] + vrider.height) * cSizeFactor;
						
						Ridingmanager.placeTokenrotated(pRiddenToken, vrider, vTargetx, vTargety, 0, pAnimations);
					}
					
					break;
				case cClusterplacement:
						let vSizeFactor = GeometricUtils.insceneSize(pRiddenToken);
				
						let vsortedTokens;
						let vsortedSizes;
						let vPlacementInterval = [0,0];
						vAngleSteps = 0;
						let vBaseRadius = 0;
						let vMaxSize;
						let vSizesumm;
						
						//sort tokens
						[vsortedTokens, vsortedSizes] = GeometricUtils.sortbymaxdim(pRiderTokenList);
						
						//place largest tokens first
						vsortedTokens.reverse();
						vsortedSizes.reverse();
						
						//for 0th token
						vMaxSize = vsortedSizes[0];
						
						while (vPlacementInterval[1] < vsortedTokens.length) {
							//placements						
							for (let i = vPlacementInterval[0]; i <= vPlacementInterval[1]; i++) {
								Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vBaseRadius * vSizeFactor * Math.sin(vAngleSteps*cGradtoRad*i), -vBaseRadius * vSizeFactor * Math.cos(vAngleSteps*cGradtoRad*i), 0, pAnimations);
							}	
							
							vBaseRadius = vBaseRadius + vMaxSize/2;
							
							//new calculations
							vPlacementInterval[0] = vPlacementInterval[1] + 1;
							vPlacementInterval[1] = vPlacementInterval[0];
							
							vMaxSize = vsortedSizes[vPlacementInterval[0]];
							vSizesumm = vsortedSizes[vPlacementInterval[0]];
							
							//check if next element exists and fits in new circumference
							while (((vPlacementInterval[1]+1) < vsortedTokens.length) && ((2*vBaseRadius + Math.max(vsortedSizes[vPlacementInterval[1]+1], vMaxSize))*Math.PI > (vSizesumm + vsortedSizes[vPlacementInterval[1]+1]))) {
										
								vPlacementInterval[1] = vPlacementInterval[1] + 1;
								
								vMaxSize = Math.max(vMaxSize, vsortedSizes[vPlacementInterval[1]]);
								vSizesumm = vSizesumm + vsortedSizes[vPlacementInterval[1]];
							}
							
							vAngleSteps = 360/(vPlacementInterval[1] - vPlacementInterval[0] + 1);		

							vBaseRadius = vBaseRadius + vMaxSize/2;
						}
						
					break;
				case cRowplacementTop:
					Ridingmanager.placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations, pRiderTokenList.map(vToken => (GeometricUtils.insceneHeight(vToken)-GeometricUtils.insceneHeight(pRiddenToken))/2));
					break;
				case cRowplacementBottom:
					Ridingmanager.placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations, pRiderTokenList.map(vToken => (-GeometricUtils.insceneHeight(vToken)+GeometricUtils.insceneHeight(pRiddenToken))/2));
					break;
				case cCornerPlacement:
				case cCornerPlacementinner:
					if (pRiderTokenList.length <= 4) {
						Ridingmanager.placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations, RideableFlags.RiderPositioning(pRiddenToken) == cCornerPlacementinner);
					}
					else {
						Ridingmanager.placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations);
					}
					break;
				case cMountPosition:
					Ridingmanager.planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations);
					break;
				case cRowplacement:
				default:
					Ridingmanager.placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations);
			}
		}
	} 
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList, pPlaceSameheight = false) {
		for (let i = 0; i < pRiderTokenList.length; i++) {
			
			if (RideableFlags.UseRidingHeight(pRiddenToken)) {
				let vTargetz = pRiddenToken.elevation;
				
				if (!isFinite(vTargetz)) {
					vTargetz = 0;
				}
				
				if (!pPlaceSameheight) {
					let vRidingHeight;		
					
					if (RideableFlags.HascustomRidingHeight(pRiddenToken)) {
						vRidingHeight = RideableFlags.customRidingHeight(pRiddenToken);
					}
					else {
						vRidingHeight = RideableUtils.Ridingheight(pRiddenToken);
					}
					
					vTargetz = vTargetz + vRidingHeight/*game.settings.get(cModuleName, "RidingHeight")*/ + RideableFlags.addRiderHeight(pRiderTokenList[i]);
				}
					
				if (pRiderTokenList[i].elevation != vTargetz) {
					pRiderTokenList[i].update({elevation: vTargetz}, {RidingMovement : true});
				}	
			}
			
			Ridingmanager.SyncSort(pRiderTokenList[i], pRiddenToken.sort + cSortDifference);
		}
	}
	
	static async fitRiders(pRiddenToken, pRiderTokenList, pSizeFactor = cSizeFactor) {
		if (pRiddenToken.documentName == "Token") {
			for (let i = 0; i < pRiderTokenList.length; i++) {
				
				if ((pRiderTokenList[i].width >= pRiddenToken.width) && (pRiderTokenList[i].height >= pRiddenToken.height)) {
					let vUpdate = {width : pSizeFactor*pRiddenToken.width, height : pSizeFactor*pRiddenToken.height};
					
					if (RideableUtils.isPf2e()) {
						vUpdate = {...vUpdate, flags : {pf2e : {linkToActorSize : false}}};
					}
					
					await pRiderTokenList[i].update(vUpdate);
				}
			}	
		}
	} 
	
	static planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		let vRiddenForm = RideableFlags.TokenForm(pRiddenToken);
		
		for (let i = 0; i < pRiderTokenList.length; i++) {
			let vTargetPosition = RideableFlags.RelativPosition(pRiderTokenList[i]);
			
			if (!RideableFlags.HasrelativPosition(pRiderTokenList[i])) {
				//if first time Rider give Border position
				if (!GeometricUtils.withinBoundaries(pRiddenToken, RideableFlags.TokenForm(pRiddenToken), GeometricUtils.CenterPosition(pRiderTokenList[i]))) {
					vTargetPosition = GeometricUtils.closestBorderposition(pRiddenToken, vRiddenForm, pRiderTokenList[i]);					
				}
				else {
					vTargetPosition = GeometricUtils.Rotated(GeometricUtils.TokenDifference(pRiderTokenList[i], pRiddenToken), -pRiddenToken.rotation);
				}
				
				vTargetPosition = [...(GeometricUtils.GridSnap(vTargetPosition, FCore.sceneof(pRiddenToken).grid, [(pRiddenToken.width+pRiderTokenList[i].width)%2,(pRiddenToken.height+pRiderTokenList[i].height)%2])), pRiderTokenList[i].rotation - pRiddenToken.rotation];

				RideableFlags.setRelativPosition(pRiderTokenList[i], vTargetPosition);
			}
			
			Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetPosition[0], vTargetPosition[1], vTargetPosition[2], pAnimations);		
		}
	}
	
	static placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations = true, pyoffset = []) {
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
				vxoffset = -GeometricUtils.insceneWidth(pRiddenToken)/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;	
				if (pRiderTokenList.length > 1) {
					vxdelta = (GeometricUtils.insceneWidth(pRiddenToken) - (GeometricUtils.insceneWidth(pRiderTokenList[pRiderTokenList.length - 1]) + GeometricUtils.insceneWidth(pRiderTokenList[0]))/2)/(pRiderTokenList.length-1);
				}
			} 
			else { //if Riders dont have to be bunched
				vbunchedRiders = false;
				
				vxoffset = -vRiderWidthSumm/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;	
			}

			for (let i = 0; i < pRiderTokenList.length; i++) {
				//update riders position in x, y
				let vTargetx = 0;
				let vTargety = 0;
				
				if (vbunchedRiders) {
					vTargetx = vxoffset + i*vxdelta;
				}
				else {
					if (i > 0) {
						vTargetx = vxoffset + (GeometricUtils.insceneWidth(pRiderTokenList[i-1])+GeometricUtils.insceneWidth(pRiderTokenList[i]))/2;
						vxoffset = vTargetx;
					}
					else {
						vTargetx = vxoffset;
					}
				}
				
				if (pyoffset.length) {
					vTargety = pyoffset[i%pyoffset.length];
				}
				
				Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, 0, pAnimations);		
			}
		}
	}
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true, pInner = false) {
		if (pRiderTokenList.length) {
			for (let i = 0; i < Math.min(Math.max(pRiderTokenList.length, cCornermaxRiders-1), pRiderTokenList.length); i++) { //no more then 4 corner places			
				let vTargetx = 0;
				let vTargety = 0;
				
				let vXoffset = 0;
				let vYoffset = 0;
				
				if (pInner) {
					vXoffset = GeometricUtils.insceneWidth(pRiderTokenList[i])/2;
					vYoffset = GeometricUtils.insceneHeight(pRiderTokenList[i])/2;
				}
				
				switch ((i + Number(game.settings.get(cModuleName, "FamiliarRidingFirstCorner")))%cCornermaxRiders) {
					case 0: //tl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2 + vXoffset;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2 + vYoffset;
						break;
						
					case 1: //tr
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2 - vXoffset;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2 + vYoffset;
						break;
						
					case 2: //bl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2 + vXoffset;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2 - vYoffset;
						break;
						
					case 3: //br
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2 - vXoffset;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2 - vYoffset;
						break;
				}
				
				Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, 0, pAnimations);		
			}
		}
	}
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pRelativerotation = 0, pAnimation = true) {	
		let vTargetx = pTargetx;
		let vTargety = pTargety;
		
		if (game.settings.get(cModuleName, "RiderRotation")) {
			//rotation
			[vTargetx, vTargety] = GeometricUtils.Rotated([pTargetx, pTargety], pRiddenToken.rotation);
			
			if (pRelativerotation) {
				pRider.update({rotation: pRiddenToken.rotation + pRelativerotation}, {animate : pAnimation, RidingMovement : true});
			}
			else {
				pRider.update({rotation: pRiddenToken.rotation}, {animate : pAnimation, RidingMovement : true});
			}
		}
		
		vTargetx = pRiddenToken.x + GeometricUtils.insceneWidth(pRiddenToken)/2 - GeometricUtils.insceneWidth(pRider)/2 + vTargetx;
		vTargety = pRiddenToken.y + GeometricUtils.insceneHeight(pRiddenToken)/2 - GeometricUtils.insceneHeight(pRider)/2 + vTargety;
			
		if ((pRider.x != vTargetx) || (pRider.y != vTargety)) {
			pRider.update({x: vTargetx, y: vTargety}, {animate : pAnimation, RidingMovement : true});
		}
	}
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
		for (let i = 0; i < pRiderTokens.length; i++) {
			if (pRiderTokens[i]) {
				let vTargetz = 0;
				
				if (pRiddenTokens[i]) {
					//set to height or previously ridden token
					vTargetz = pRiddenTokens[i].elevation;
					
					if (!isFinite(vTargetz)) {
						vTargetz = 0;
					}
					
					Ridingmanager.SyncSort(pRiderTokens[i], pRiddenTokens[i].sort);
				}
				else {
					//reduce height by riding height
					vTargetz = pRiderTokens[i].elevation - RideableUtils.Ridingheight();
					
					Ridingmanager.SyncSort(pRiderTokens[i], 0);
				} 

				if (!pRiddenTokens[i] || RideableFlags.UseRidingHeight(pRiddenTokens[i])) {
					pRiderTokens[i].update({elevation: vTargetz}, {RidingMovement : true});
				}
			}
		}
	}
	
	//static
	static SyncSort(pDocument, pSort) {
		if (game.user.isGM) {
			pDocument.sort = pSort;
			
			let vData = {};
			
			vData.pSceneID = pDocument.parent.id;
			vData.pCollectionName = pDocument.parentCollection;
			vData.pDocumentID = pDocument.id;
			
			vData.pSort = pSort;
			
			game.socket.emit("module."+cModuleName, {pFunction : "SyncSortRequest", pData : vData});
		}
	}
	
	static SyncSortRequest(pDocumentID, pCollectionName, pSceneID, pSort) {
		let vScene = game.scenes.get(pSceneID);
		
		if (vScene) {
			let vDocument = vScene[pCollectionName].get(pDocumentID);
			
			if (vDocument) {
				vDocument.sort = pSort;
			}
		}
	}
	
	//external movement
	static MoveRiddenGM(pRidden, pRelativChanges, pInfos) {
		if (pRidden) {
			if (pInfos.MovedbyPilot) {
				let vScene = FCore.sceneof(pRidden);
				
				let vPilot = vScene.tokens.get(pInfos.PilotID);
				
				if (RideableUtils.canbeMoved(pRidden)) {
					if (vPilot && RideableFlags.isPilotedby(pRidden, vPilot)) {
						let vTarget = {};
						
						for (let i = 0; i < cMotionProperties.length; i++) {
							if (pRelativChanges.hasOwnProperty(cMotionProperties[i]) && (cMotionProperties[i] != "rotation" || game.settings.get(cModuleName, "RiderRotation"))) {
								vTarget[cMotionProperties[i]] = pRidden[cMotionProperties[i]] + pRelativChanges[cMotionProperties[i]];
							}
						}
						
						pRidden.update(vTarget);
					}
					else {
						RideablePopups.TextPopUpID(vPilot ,"cantPilot", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP	
					}					
				}
				else {
					RideablePopups.TextPopUpID(vPilot ,"cantbeMoved", {pRiddenName : RideableFlags.RideableName(pRidden)}); //MESSAGE POPUP	
				}
			}
		}
	}
	
	static RequestMoveRidden(pRidden, pRelativChanges, pInfos) {
		if (game.user.isGM) {
			Ridingmanager.MoveRiddenGM(pRidden, pRelativChanges, pInfos);
		}
		else {
			if (!game.paused && pRidden) {
				game.socket.emit("module."+cModuleName, {pFunction : "MoveRiddenRequest", pData : {pRiddenID : pRidden.id, pSceneID : FCore.sceneof(pRidden).id, pRelativChanges : pRelativChanges, pInfos : pInfos}});
			}
		}
	}
	
	static MoveRiddenRequest(pRiddenID, pSceneID, pRelativChanges, pInfos) {
		if (game.user.isGM) {
			let vScene = game.scenes.get(pSceneID);
			
			Ridingmanager.MoveRiddenGM(RideableUtils.TokenfromID(pRiddenID, vScene), pRelativChanges, pInfos);
		}
	}
	
	//support
	static MovementDelta(pToken, pchanges) {
		let vDelta = {};
		
		vDelta.x = (pchanges.x != undefined) ? pchanges.x-pToken.x : 0;
		vDelta.y = (pchanges.y != undefined) ? pchanges.y-pToken.y : 0;
		vDelta.rotation = (pchanges.rotation != undefined) ? pchanges.rotation-pToken.rotation : 0;
		vDelta.elevation = (pchanges.elevation != undefined) ? pchanges.elevation-pToken.elevation : 0;
		
		return vDelta;
	}
	
	static keydownMoveReplacement() {
		if (canvas.grid.type == 1) {
			const csize = canvas.grid.size;
			let vReplacement = {x : 0, y : 0};
			
			if (game.keyboard.downKeys.intersection(cupkeys).size) {
				vReplacement.y = vReplacement.y - csize;
			}
			
			if (game.keyboard.downKeys.intersection(cdownkeys).size) {
				vReplacement.y = vReplacement.y + csize;
			}
			
			if (game.keyboard.downKeys.intersection(cleftkeys).size) {
				vReplacement.x = vReplacement.x - csize;
			}
			
			if (game.keyboard.downKeys.intersection(crightkeys).size) {
				vReplacement.x = vReplacement.x + csize;
			}
			
			if (!vReplacement.x && !vReplacement.y) {
				return {};
			}
			
			return vReplacement;
		}
		
		return {};
	}
}

//export

function UpdateRidderTokens(priddenToken, vRiderTokenList, pAnimations = true) {
	Ridingmanager.UpdateRidderTokens(priddenToken, vRiderTokenList, pAnimations);
}
function UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
	Ridingmanager.UnsetRidingHeight(pRiderTokens, pRiddenTokens);
}

function MoveRiddenRequest({pRiddenID, pSceneID, pRelativChanges, pInfos} = {}) {
	Ridingmanager.MoveRiddenRequest(pRiddenID, pSceneID, pRelativChanges, pInfos);
}

function SyncSortRequest({pDocumentID, pCollectionName, pSceneID, pSort} = {}) {
	Ridingmanager.SyncSortRequest(pDocumentID, pCollectionName, pSceneID, pSort);
}

export { UpdateRidderTokens, UnsetRidingHeight, MoveRiddenRequest, SyncSortRequest };

//Set Hooks
Hooks.on("updateToken", (...args) => Ridingmanager.OnTokenupdate(...args));

Hooks.on("updateTile", (...args) => Ridingmanager.OnTokenupdate(...args, true));

Hooks.on("preUpdateToken", (...args) => Ridingmanager.OnTokenpreupdate(...args));
