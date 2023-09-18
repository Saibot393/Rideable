import { cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "../helpers/RideableFlags.js";
import { RideablePopups } from "../helpers/RideablePopups.js";
import { GeometricUtils } from "../utils/GeometricUtils.js";

//Module Names
const cStairways = "stairways";
const cTagger = "tagger";
const cWallHeight = "wall-height";
const cLevelsautocover = "levelsautocover";
const cArmReach = "foundryvtt-arms-reach";
const cArmReachold = "arms-reach";
const cLocknKey = "LocknKey"; //self promotion
const cLibWrapper = "lib-wrapper";
const cDfredCE = "dfreds-convenient-effects";
const cTokenAttacher = "token-attacher";
const cTokenZ = "token-z";

//SpecialFlags
const cPreviousIDF = "PreviousIDFlag"; //Flag for saving previous ID, used in compatibility with [stairways]

//special words
const cLockTypeRideable = "LTRideable"; //for LocknKey

const cRideableTag = "Rideable:"; //For tagger

const cGrabbedEffectName = "Grappled"; //For convenient effects

export { cStairways, cTagger, cWallHeight, cArmReach, cArmReachold, cLocknKey, cLockTypeRideable, cLibWrapper, cDfredCE, cTokenAttacher, cTokenZ }
export { cRideableTag, cGrabbedEffectName }

//should only be imported by RideableUtils, Rideablesettings and RideableCompatibility
//RideableCompUtil will take care of compatibility with other modules in regards to information handling, currently supported:
//-WallHeight
class RideableCompUtils {
	//DECLARATIONS
	//basic
	static isactiveModule(pModule) {} //determines if module with id pModule is active
	
	static ignoreSpawn(pInfo) {} //returns if a spawn with this pInfo should be ignored by Rideable
	
	static issettingMountableandUn(pToken, pPopup) {} //returns if token is Mountable and Unmountable according to settings [LocknKey]
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {} //[ArmReachold, ArmReach] gives the current arms reach distance
	
	static ARWithinMountingDistance(pRider, pRidden) {} //[ArmReach] returns if pRider is close enought to pRidden to mount
	
	//specific: stairways
	static UpdatePreviousID(pToken) {} //sets the previous id to the current ID
	
	static PreviousID(pToken) {} //gives the previous ID
	
	static TokenwithpreviousID(pID, pScene) {} //gives the token in pScene which has the previous id pID (if any)
	
	static UpdateRiderIDs(pRidden) {} //tries to fiend the current riders in the currrent scene based on their previous ids
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {} //[Wall-Height] gives the Height the Wall-Height module assigns pToken
	
	//specific: dfreds-convenient-effects
	static async AddDfredEffect(pEffects, pToken) {} //uses dfreds api to add effects with pEffectNames to pToken
	
	static async RemoveRideableDfredEffect(pEffects, pToken) {} //uses dfreds api to remove effects with pEffectNames to pToken
	
	static FilterEffects(pNameIDs) {} //returns an array of effects fitting the ids or names in pNameIDs
	
	//specific: token attacher
	static isTAAttached(pToken, pObject, pReverseCheck = true) {} //returns if pObject is attached to pToken or vice versa
	
	//IMPLEMENTATIONS
	//basic
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
	
	static ignoreSpawn(pInfo) {
				//stairways
		return (pInfo.isUndo)
	}
	
	static issettingMountableandUn(pToken, pPopup) {
		let vMountableUn = true;
		
		if (RideableCompUtils.isactiveModule(cLocknKey) && game.settings.get(cModuleName, "LocknKeyintegration")) {
			//check if token is locked [LocknKey]
			vMountableUn = !pToken.getFlag(cLocknKey, "LockableFlag") || !pToken.getFlag(cLocknKey, "LockedFlag");

			if (pPopup && !vMountableUn) {
				RideablePopups.TextPopUpID(pToken ,"RiddenisLocked", {pRiddenName : pToken.name});
			}

		}
		
		return vMountableUn;
	}
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {
		if (RideableCompUtils.isactiveModule(cArmReach)) {
			return game.settings.get(cArmReach, "globalInteractionMeasurement");
		}
		
		if (RideableCompUtils.isactiveModule(cArmReachold)) {
			return game.settings.get(cArmReachold, "globalInteractionDistance");
		}
		
		return Infinity; //if anything fails
	}
	
	static ARWithinMountingDistance(pRider, pRidden) {
		if (RideableCompUtils.isactiveModule(cArmReach)) {
			return game.modules.get(cArmReach).api.isReachable(pRider, pRidden);
		}		
		
		if (RideableCompUtils.isactiveModule(cArmReachold)) {
			return game.modules.get(cArmReachold).api.isReachable(pRider, pRidden);
		}	
		
		return true;//if anything failse
	}
	
	//specific: stairways
	static UpdatePreviousID(pToken) {
		if (pToken) {
			pToken.setFlag(cModuleName, cPreviousIDF, pToken.id);
		}
	}
	
	static PreviousID(pToken) {
		if (pToken) {
			if (pToken.flags.Rideable) {
				if (pToken.flags.Rideable.PreviousIDFlag) {
					return pToken.flags.Rideable.PreviousIDFlag;
				}
			}
		}
		return "";
	}
	
	static TokenwithpreviousID(pID, pScene) {	
		return pScene.tokens.filter(vToken => RideableCompUtils.PreviousID(vToken) == pID)[0];
	}
	
	static async UpdateRiderIDs(pRidden) {
		let vPreviousRiderIDs = RideableFlags.RiderTokenIDs(pRidden);
		
		let vNewRiders = await game.scenes.find(vscene => vscene.tokens.get(pRidden.id)).tokens.filter(vToken => vPreviousRiderIDs.includes(RideableCompUtils.PreviousID(vToken)));
		
		await RideableFlags.cleanRiderIDs(pRidden);
		
		for (let i = 0; i < vNewRiders.length; i++) {
			//force new riders
			await RideableFlags.addRiderTokens(pRidden, [vNewRiders[i]], {Familiar: RideableFlags.wasFamiliarRider(vNewRiders[i]), Grappled: RideableFlags.wasGrappled(vNewRiders[i])}, true);
			
			RideableCompUtils.UpdatePreviousID(vNewRiders[i]);
		}
	} 
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {
		if (RideableCompUtils.isactiveModule(cWallHeight)) {  //based on wall-height(by theripper93)>utils>getTokenLOSheight (no longer ugly)
			if (pToken) {
				let vHeightdiff;
				let vdivider = 1;
				  
				if (RideableCompUtils.isactiveModule(cLevelsautocover)) {
					if (pToken.flags[cLevelsautocover]) {
						if (pToken.flags[cLevelsautocover].ducking) {
							vdivider = 3;
						}
					}
				}
				  
				if (pToken.flags[cWallHeight] && pToken.flags[cWallHeight].tokenHeight) {
					vHeightdiff = pToken.flags[cWallHeight].tokenHeight;
				}
				else {
					if (game.settings.get(cWallHeight, 'autoLOSHeight')) {
						vHeightdiff = game.scenes.find(vscene => vscene.tokens.get(pToken.id)).dimensions.distance * Math.max(pToken.width, pToken.height) * ((Math.abs(pToken.texture.scaleX) + Math.abs(pToken.texture.scaleY)) / 2);
					}
					else {
						vHeightdiff =  game.settings.get(cWallHeight, 'defaultLosHeight');
					}
				}
				
				if (pWithElevation) {
					return pToken.elevation + vHeightdiff / vdivider;
				}
				else {
					return vHeightdiff / vdivider;
				}
			}
		}
		else {
			return 0;
		}
	}
	
	//specific: dfreds-convenient-effects
	static async AddDfredEffect(pEffects, pToken) {
		for (let i = 0; i < pEffects.length; i++) {
			console.log(pEffects[i]);
			await game.dfreds.effectInterface._socket.executeAsGM('addEffect', {
			  effect: pEffects[i].toObject(),
			  uuid : pToken.actor.uuid,
			  origin : cModuleName
			});
			/*
			game.dfreds.effectInterface.addEffect({effectName : pEffectNames[i], uuid : pToken.actor.uuid, origin : cModuleName})
			*/
		}
	}
	
	static async RemoveRideableDfredEffect(pEffects, pToken) {
		for (let i = 0; i < pEffects.length; i++) {
			let vName = pEffects[i].name;
			
			if (!vName) {
				vName = pEffects[i].label;
			}
			
			await game.dfreds.effectInterface._socket.executeAsGM('removeEffect', {
			  effectName: vName,
			  uuid : pToken.actor.uuid,
			  origin : cModuleName
			});
			//game.dfreds.effectInterface.removeEffect({effectName : pEffectNames[i], uuid : pToken.actor.uuid, origin : cModuleName})
		}		
	}
	
	static FilterEffects(pNameIDs) {
		let vNameIDs = [];
		
		let vBuffer;
		
		for (let i = 0; i < pNameIDs.length; i++) {
			vBuffer = game.dfreds.effects._all.find(vEffect => vEffect.name == pNameIDs[i] || vEffect.label == pNameIDs[i]);
			
			if (vBuffer) {
				vNameIDs.push(vBuffer);
			}
			else {
				vBuffer = game.dfreds.effects._customEffectsHandler._findCustomEffectsItem().effects.get(pNameIDs[i]);
				
				if (!vBuffer) {
					vBuffer = game.dfreds.effects._customEffectsHandler._findCustomEffectsItem().effects.find(v => v.name == pNameIDs[i]);
				}
				
				if (vBuffer) {
					vNameIDs.push(vBuffer);
				}
			}
		}
		
		return vNameIDs;
	}
	
	//specific: token attacher
	static isTAAttached(pToken, pObject, pReverseCheck = true) {
		console.log("check", pToken, pObject);
		let vAttached = false;
		
		if (pObject.flags.hasOwnProperty(cTokenAttacher)) {
			vAttached = (pObject.flags[cTokenAttacher].parent == pToken.id);
		}
		
		if (!vAttached && pReverseCheck && (pObject.documentName == "Token")) {
			vAttached = RideableCompUtils.isTAAttached(pObject, pToken, false);
		}
	
		return vAttached;
	}
}

export { RideableCompUtils };