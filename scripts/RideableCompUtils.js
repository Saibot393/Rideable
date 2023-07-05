//Module Names
const cStairways = "Stairways";
const cTagger = "tagger";
const cWallHeight = "wall-height";
const cLevelsautocover = "levelsautocover";

export { cStairways, cTagger, cWallHeight }

//RideableCompUtil will take care of compatibility with other modules in regards to information handling, currently supported:

class RideableCompUtils {
	//DECLARATIONS
	//basic
	static isactiveModule(pModule) {}; //determines if module with id pModule is active
	
	//specific: Tagger
	static TokenHasTag(pToken, pTag) {};//[Tagger] looks up Tags of pToken and returns true if tags contain pTag
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {} //guesses the Height the Wall-Height module assigns pToken
	
	//IMPLEMENTATIONS
	//basic
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken, pWithElevation = false) {
		if (RideableCompUtils.isactiveModule(cWallHeight)) { //based on wall-height(by theripper93)>utils>getTokenLOSheight (reorderd and polished)
			if (pToken) {
				let vTokenDocument = pToken;
				
				//allow either a token document or a token
				if (pToken.document) {
					vTokenDocument = pToken.document;
				}
				
				let vHeightdiff;
				let vdivider = 1;
				  
				if (RideableCompUtils.isactiveModule(cLevelsautocover)) {
					if (vTokenDocument.flags[cLevelsautocover]) {
						if (vTokenDocument.flags[cLevelsautocover].ducking) {
							vdivider = 3;
						}
					}
				}
				  
				if (vTokenDocument.flags[cWallHeight] && vTokenDocument.flags[cWallHeight].tokenHeight) {
					vHeightdiff = vTokenDocument.flags[cWallHeight].tokenHeight;
				}
				else {
					if (game.settings.get(cWallHeight, 'autoLOSHeight')) {
						vHeightdiff = canvas.scene.dimensions.distance * Math.max(vTokenDocument.width, vTokenDocument.height) * ((Math.abs(vTokenDocument.texture.scaleX) + Math.abs(vTokenDocument.texture.scaleY)) / 2);
					}
					else {
						vHeightdiff =  game.settings.get(cWallHeight, 'defaultLosHeight');
					}
				}
				
				if (pWithElevation) {
					return vTokenDocument.elevation + vHeightdiff / vdivider;
				}
				else {
					return vHeightdiff / vdivider;
				}
			}
		}
	}
}

export { RideableCompUtils };