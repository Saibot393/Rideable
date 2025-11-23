import * as FCore from "../CoreVersionComp.js";

import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "../helpers/RideableFlags.js";
import { RideablePopups } from "../helpers/RideablePopups.js";
import { GeometricUtils } from "../utils/GeometricUtils.js";

//System Names

const cDnD5e = "dnd5e";

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
const cRoutingLib = "routinglib";
const cMATT = "monks-active-tiles";
const cCPR = "chris-premades";
const cTerrainMapper = "fvtt-terrain-mapper";

//SpecialFlags
const cPreviousIDF = "PreviousIDFlag"; //Flag for saving previous ID, used in compatibility with [stairways]

//special words
const cLockTypeRideable = "LTRideable"; //for LocknKey

const cRideableTag = "Rideable:"; //For tagger

const cGrabbedEffectName = "Grappled"; //For convenient effects

const cTokenFormAttachedTiles = "TokenFormAttachedTiles"; //For Token Attacher

export { cDnD5e, cStairways, cTagger, cWallHeight, cArmReach, cArmReachold, cLocknKey, cLockTypeRideable, cLibWrapper, cDfredCE, cTokenAttacher, cTokenZ, cRoutingLib, cMATT, cCPR, cTerrainMapper }
export { cRideableTag, cGrabbedEffectName, cTokenFormAttachedTiles }

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
	
	static UpdateRiderIDs(pRidden, vCleanIDs = true) {} //tries to fiend the current riders in the currrent scene based on their previous ids
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {} //[Wall-Height] gives the Height the Wall-Height module assigns pToken
	
	//effect modules specific: dfreds-convenient-effects & chris premades
	static hasactiveEffectModule() {} //returns if an effect module compatibility is enabled
	
	static async addIDNameEffects(pNameIDs, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //adds effects matching pNameIDs to pToken using compatible modules
	
	static async RemoveRideableEffects(pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //removes rideable effects from pToken actor
	
	static isRideableEffect(pEffect, pInfos = {forMountEffect : false, grappleEffect : false}) {} //returns if pEffect is a rideable effect
	
	//specific: dfreds-convenient-effects
	static async AddDfredEffect(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //uses dfreds api to add effects with pEffectNames to pToken
	
	static async RemoveRideableDfredEffect(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //uses dfreds api to remove effects with pEffectNames to pToken
	
	static async FilterDFEffects(pNameIDs) {} //returns an array of effects fitting the ids or names in pNameIDs
	
	//specific: chris premades
	static async AddCPREffects(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //uses CPR to add effects to pToken
	
	static async RemoveRideableCPREffects(pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {} //uses CPR to remove effects to pToken
	
	static FilterCPREffects(pNameIDs) {} //returns array of effects datas
	
	//specific: token attacher
	static isTAAttachedto(pToken, pObject) {} //returns if pObject is attached to pToken or vice versa
	
	static TAAttachedTiles(pToken) {} //returns the tiles attached to pToken
	
	static TAparentToken(pObject) {} //returns the token pObject is attached to (if any)
	
	static isTAAttached(pObject) {} //returns of pObject is attached to a token
	
	static hasTAAttachedTiles(pToken) {} //returns if pToken has attached tiles
	
	//specific: routing lib-wrapper
	static async RLRoute(pToken, pTarget, pbeforeEnd = 0) {} //returns the route of pToken to pTarget(x,y)
	
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
	
	static async UpdateRiderIDs(pRidden, vCleanIDs = true) {
		let vPreviousRiderIDs = RideableFlags.RiderTokenIDs(pRidden);
		
		let vNewRiders = await game.scenes.find(vscene => vscene.tokens.get(pRidden.id)).tokens.filter(vToken => vPreviousRiderIDs.includes(RideableCompUtils.PreviousID(vToken)));
		
		if (vCleanIDs) await RideableFlags.cleanRiderIDs(pRidden);
		
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
					let vElevation = pToken.elevation;
					
					if (!isFinite(vElevation)) {
						vElevation = 0;
					}
					
					return vElevation + vHeightdiff / vdivider;
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
	
	//effect modules specific: dfreds-convenient-effects & chris premades
	static hasactiveEffectModule() {
		return (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) || (RideableCompUtils.isactiveModule(cCPR) && game.settings.get(cModuleName, "CPREffectsIntegration"))
	} 
	
	static async addIDNameEffects(pNameIDs, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		if (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) {
			await RideableCompUtils.AddDfredEffect(await RideableCompUtils.FilterDFEffects(pNameIDs), pToken, pInfos);
		}

		if (RideableCompUtils.isactiveModule(cCPR) && game.settings.get(cModuleName, "CPREffectsIntegration")) {
			await RideableCompUtils.AddCPREffects(RideableCompUtils.FilterCPREffects(pNameIDs), pToken, pInfos);
		}
	}
	
	static async RemoveRideableEffects(pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vEffectIDs = pToken.actor.effects.filter(vEffect => RideableCompUtils.isRideableEffect(vEffect, pInfos)).map(vEffect => vEffect.id);

		await pToken.actor.deleteEmbeddedDocuments("ActiveEffect", vEffectIDs);
	}
	
	static isRideableEffect(pEffect, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vPostFix = "";
		
		if (pInfos.forMountEffect) {
			vPostFix = ".forMount";
		}
		
		if (pInfos.grappleEffect) {
			vPostFix = ".grapple";
		}
		
		return pEffect.origin == cModuleName + vPostFix;
	}
	
	//specific: dfreds-convenient-effects
	static async AddDfredEffect(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vPostFix = "";
		
		if (pInfos.forMountEffect) {
			vPostFix = ".forMount";
		}
		
		if (pInfos.grappleEffect) {
			vPostFix = ".grapple";
		}
		
		if (game.release.generation < 12) {
			for (let i = 0; i < pEffects.length; i++) {
				await game.dfreds.effectInterface._socket.executeAsGM('addEffect', {
				  effect: pEffects[i].toObject(),
				  uuid : pToken.actor.uuid,
				  origin : cModuleName + vPostFix
				});
				/*
				game.dfreds.effectInterface.addEffect({effectName : pEffectNames[i], uuid : pToken.actor.uuid, origin : cModuleName})
				*/
			}
		}
		else {
			for (let i = 0; i < pEffects.length; i++) {
				await game.dfreds.effectInterface.addEffect({
					effectData: {...pEffects[i].toObject(),
								 origin : cModuleName + vPostFix},
					uuid : pToken.actor.uuid
				});
				/*
				game.dfreds.effectInterface.addEffect({effectName : pEffectNames[i], uuid : pToken.actor.uuid, origin : cModuleName})
				*/
			}
		}
	}
	
	static async RemoveRideableDfredEffect(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vPostFix = "";
		
		if (pInfos.forMountEffect) {
			vPostFix = ".forMount";
		}
		
		if (pInfos.grappleEffect) {
			vPostFix = ".grapple";
		}
		
		if (game.release.generation < 12) {
			for (let i = 0; i < pEffects.length; i++) {
				let vName = pEffects[i].name;
				
				if (!vName) {
					vName = pEffects[i].label;
				}
				
				await game.dfreds.effectInterface._socket.executeAsGM('removeEffect', {
				  effectName: vName,
				  uuid : pToken.actor.uuid,
				  origin : cModuleName + vPostFix
				});
				//game.dfreds.effectInterface.removeEffect({effectName : pEffectNames[i], uuid : pToken.actor.uuid, origin : cModuleName})
			}	
		}
		else {
			for (let i = 0; i < pEffects.length; i++) {
				let vName = pEffects[i].name;
				
				if (!vName) {
					vName = pEffects[i].label;
				}
			
				await game.dfreds.effectInterface.removeEffect({
					effectName: vName,
					uuid : pToken.actor.uuid,
					origin : cModuleName + vPostFix
				});
			}
		}
	}
	
	static async FilterDFEffects(pNameIDs) {
		let vNameIDs = [];
		
		let vBuffer;
		
		if (game.release.generation < 12) {
			for (let i = 0; i < pNameIDs.length; i++) {
				vBuffer = game.dfreds.effects?._all.find(vEffect => vEffect.name == pNameIDs[i] /*|| vEffect.label == pNameIDs[i]*/);
				
				if (vBuffer) {
					vNameIDs.push(vBuffer);
				}
				else {
					vBuffer = game.dfreds.effects?._customEffectsHandler._findCustomEffectsItem()?.effects.get(pNameIDs[i]);
					
					if (!vBuffer) {
						vBuffer = game.dfreds.effects?._customEffectsHandler._findCustomEffectsItem()?.effects.find(v => v.name == pNameIDs[i]);
					}
					
					if (vBuffer) {
						vNameIDs.push(vBuffer);
					}
				}
			}
		}
		else {
			for (let i = 0; i < pNameIDs.length; i++) {
				if (pNameIDs[i]) {
					vBuffer = await game.dfreds.effectInterface.findEffect({effectName : pNameIDs[i]});
					
					if (!vBuffer) {
						vBuffer = await game.dfreds.effectInterface.findEffect({effectId : pNameIDs[i]});
					}	
						
					if (!vBuffer) {
						vBuffer = await fromUuid(pNameIDs[i]);
					}
						
					if (vBuffer) {
						vNameIDs.push(vBuffer);
					}
				}
			}
		}
		
		return vNameIDs;
	}
	
	//specific: chris premades
	static async AddCPREffects(pEffects, pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vPostFix = "";
		
		if (pInfos.forMountEffect) {
			vPostFix = ".forMount";
		}
		
		if (pInfos.grappleEffect) {
			vPostFix = ".grapple";
		}
		
		//pEffects.forEach(vEffect => vEffect.origin = cModuleName + vPostFix);
		
		//pToken.actor.createEmbeddedDocuments("ActiveEffect", pEffects)
		await pToken.actor.createEmbeddedDocuments("ActiveEffect", pEffects, {keepId: true});
		
		for (let vEffect of pEffects) {
			let vAppliedEffect = pToken.actor.effects.find(vAE => vAE._source?._id == vEffect.id);
			
			if (vAppliedEffect) {
				await vAppliedEffect.update({origin : cModuleName + vPostFix});
			}
		}
	}
	
	static async RemoveRideableCPREffects(pToken, pInfos = {forMountEffect : false, grappleEffect : false}) {
		let vPostFix = "";
		
		if (pInfos.forMountEffect) {
			vPostFix = ".forMount";
		}
		
		if (pInfos.grappleEffect) {
			vPostFix = ".grapple";
		}
		
		let vEffectIDs = pToken.actor.effects.filter(vEffect => vEffect.origin == cModuleName + vPostFix).map(vEffect => vEffect.id);
		
		await pToken.actor.deleteEmbeddedDocuments("ActiveEffect", vEffects);
	}
	
	static FilterCPREffects(pNameIDs) {
		let vEffects = game.items.find(i => i.flags[cCPR]?.effectInterface).collections.effects;
		
		if (!vEffects) {
			return [];
		}
		
		return vEffects.filter(vEffect => pNameIDs.find(vNameID => vEffect.name == vNameID || vEffect.id == vNameID || vEffect.uuid == vNameID));
	}
	
	//specific: token attacher
	static isTAAttachedto(pToken, pObject) {
		if (!pToken || !pObject) {
			return false;
		}
		
		if (pToken == pObject) {
			return true;
		}
		
		let vAttached = false;
		
		if (pObject.flags.hasOwnProperty(cTokenAttacher)) {
			vAttached = (pObject.flags[cTokenAttacher].parent == pToken.id) || RideableFlags.RidingConnection(pToken, pObject);
			
			if (!vAttached) {
				vAttached = RideableCompUtils.isTAAttachedto(pToken, RideableUtils.TokenfromID(pObject.flags[cTokenAttacher].parent, FCore.sceneof(pObject)));
			}
		}
		
		/*
		if (!vAttached && pReverseCheck && (pObject.documentName == "Token")) {
			vAttached = RideableCompUtils.isTAAttached(pObject, pToken, false);
		}
		*/
	
		return vAttached;
	}
	
	static TAAttachedTiles(pToken) {
		let vTiles = FCore.sceneof(pToken)?.tiles.filter(vTile => vTile.flags[cTokenAttacher]?.parent == pToken.id);
		
		if (vTiles && vTiles.length) {
			return vTiles;
		}
		else {
			return []
		}
	}
	
	static TAparentToken(pObject) {
		if (pObject) {
			return FCore.sceneof(pObject)?.tokens.get(pObject.flags[cTokenAttacher]?.parent);
		}
		
		return;
	}
	
	static isTAAttached(pObject) {
		return Boolean(pObject.flags[cTokenAttacher]?.parent);
	}
	
	static hasTAAttachedTiles(pToken) {
		return Boolean(FCore.sceneof(pToken)?.tiles.find(vTile => vTile.flags[cTokenAttacher]?.parent == pToken.id));
	}
	
	//specific: routinglib-wrapper
	static async RLRoute(pToken, pTarget, pTargetCoordinates = {}, pbeforeEnd = 0) {
		let vStart = {};
		
		let vTarget = {};
		let vTargetCoordinates = {...{x : pTarget.x, y : pTarget.y}, ...pTargetCoordinates};
		
		let vRoute = [];
		
		let vGridSize = pToken.parent.grid.size;
		
		switch (pToken.parent.grid.type) {
			case 1:
				//squares	
				vStart.x = Math.round((pToken.x)/vGridSize);
				vStart.y = Math.round((pToken.y)/vGridSize);
				
				vTarget.x = Math.round((vTargetCoordinates.x)/vGridSize);
				vTarget.y = Math.round((vTargetCoordinates.y)/vGridSize);
				break;
			case 0: 
				//no grid
				vStart = GeometricUtils.CenterPositionXY(pToken);
				
				if (pTarget.documentName == "Token") {
					vTarget = GeometricUtils.CenterPositionXY(pTarget, vTargetCoordinates);
				}
				else {
					vTarget = vTargetCoordinates;
				}
				break;
			default:
				break;
		}

		vRoute = (await routinglib.calculatePath(vStart, vTarget, {token : pToken.object}))?.path;

		if (vRoute) {
			switch (pToken.parent.grid.type) {
				case 1:
					//squares
					vRoute = vRoute.map(vPoint => ({x : vPoint.x * vGridSize, y : vPoint.y * vGridSize}));
					break;
				case 0: 
					//no grid
					vRoute = GeometricUtils.CenterRoutetoXY(vRoute, pToken);
					break;
				default:
					break;
			}
			
			vRoute = vRoute.filter(vPoint => vPoint);
		}
		else {
			vRoute = [];
		}

		if (pTarget.elevation != pToken.elevation) {
			vRoute.forEach((vPoint, i) => vPoint.elevation = pToken.elevation + (pTarget.elevation - pToken.elevation)/vRoute.length * (i+1));
		}

		vRoute = GeometricUtils.CutRoute(vRoute, pbeforeEnd, pToken.parent.grid);
		
		return vRoute;
	}
}

export { RideableCompUtils };