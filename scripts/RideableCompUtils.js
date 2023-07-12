import { cModuleName } from "./RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";

//Module Names
const cStairways = "stairways";
const cTagger = "tagger";
const cWallHeight = "wall-height";
const cLevelsautocover = "levelsautocover";
const cArmReach = "foundryvtt-arms-reach";
const cArmReachold = "arms-reach";

//SpecialFlags
const cPreviousIDF = "PreviousIDFlag"; //Flag for saving previous ID, used in compatibility with [stairways]

export { cStairways, cTagger, cWallHeight, cArmReach, cArmReachold }

//should only be imported by RideableUtils, Rideablesettings and RideableCompatibility
//RideableCompUtil will take care of compatibility with other modules in regards to information handling, currently supported:
//-WallHeight
class RideableCompUtils {
	//DECLARATIONS
	//basic
	static isactiveModule(pModule) {} //determines if module with id pModule is active
	
	static ignoreSpawn(pInfo) {} //returns if a spawn with this pInfo should be ignored by Rideable
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {} //[ArmsReach] gives the current arms reach distance
	
	//specific: stairways
	static UpdatePreviousID(pToken) {} //sets the previous id to the current ID
	
	static PreviousID(pToken) {} //gives the previous ID
	
	static TokenwithpreviousID(pID, pScene) {} //gives the token in pScene which has the previous id pID (if any)
	
	static UpdateRiderIDs(pRidden) {} //tries to fiend the current riders in the currrent scene based on their previous ids
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {} //[Wall-Height] gives the Height the Wall-Height module assigns pToken
	
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
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {
		if (RideableCompUtils.isactiveModule(cArmReach)) {
			return game.settings.get(cArmReach, "globalInteractionMeasurement");
		}
		
		if (RideableCompUtils.isactiveModule(cArmReachold)) {
			return game.settings.get(cArmReachold, "globalInteractionDistance");
		}
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
			await RideableFlags.addRiderTokens(pRidden, [vNewRiders[i]], RideableFlags.wasFamiliarRider(vNewRiders[i]), true);
			
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
}

export { RideableCompUtils };