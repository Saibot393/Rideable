//Module Names
const cStairways = "Stairways";
const cTagger = "tagger";
const cWallHeight = "wall-height";
const cLevelsautocover = "levelsautocover";
const cArmReach = "foundryvtt-arms-reach";

export { cStairways, cTagger, cWallHeight, cArmReach }

//should only be imported by RideableUtils and Rideablesettings
//RideableCompUtil will take care of compatibility with other modules in regards to information handling, currently supported:
//-WallHeight
class RideableCompUtils {
	//DECLARATIONS
	//basic
	static isactiveModule(pModule) {} //determines if module with id pModule is active
	
	//specific: Tagger
	static TokenHasTag(pToken, pTag) {}//[Tagger] looks up Tags of pToken and returns true if tags contain pTag
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {} //[ArmsReach] gives the current arms reach distance
	
	//specific: wall-heights
	static WHTokenHeight(pToken, pWithElevation = false) {} //[Wall-Height] gives the Height the Wall-Height module assigns pToken
	
	//IMPLEMENTATIONS
	//basic
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
	
	//specific: Foundry ArmsReach
	static ARReachDistance() {
		if (RideableCompUtils.isactiveModule(cArmReach)) {
			return game.settings.get(cArmReach, "globalInteractionMeasurement")
		}
	}
	
	//specific: wall-heights
	static WHTokenHeight(pToken, pWithElevation = false) {
		if (RideableCompUtils.isactiveModule(cWallHeight)) {
			let vToken = pToken;
				
			//allow either a token document or a token
			if (pToken.object) {
				vToken = pToken.object;
			}
			
			if (pWithElevation) {
				return vToken.losHeight
			}
			else {
				return vToken.losHeight - vToken.document.elevation;
			}
		}
		else {
			return 0;
		}
	}
}

export { RideableCompUtils };