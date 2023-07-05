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
	static guessWHTokenHeight(pToken) {} //guesses the Height the Wall-Height module assigns pToken
	
	//IMPLEMENTATIONS
	//basic
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
	
	//specific: wall-heights
	static guessWHTokenHeight(pToken) {
		if (RideableCompUtils.isactiveModule(cWallHeight)) { //based on wall-height>utils>getTokenLOSheight (no longer ugly)
			if (pToken) {
				let vHeightdiff;
				let vdivider = 1;
				  
				if (RideableCompUtils.isactiveModule(cLevelsautocover)) {
					if (pToken.document.flags[cLevelsautocover]) {
						if (pToken.document.flags[cLevelsautocover].ducking) {
							vdivider = 3;
						}
					}
				}
				  
				if (pToken.document.flags[cWallHeight] && pToken.document.flags[cWallHeight].tokenHeight) {
					vHeightdiff = pToken.document.flags[cWallHeight].tokenHeight;
				}
				else {
					if (game.settings.get(cWallHeight, 'autoLOSHeight')) {
						vHeightdiff = canvas.scene.dimensions.distance * Math.max(pToken.document.width, pToken.document.height) * ((Math.abs(pToken.document.texture.scaleX) + Math.abs(pToken.document.texture.scaleY)) / 2);
					}
					else {
						vHeightdiff =  game.settings.get(cWallHeight, 'defaultLosHeight');
					}
				}

				return pToken.document.elevation + vHeightdiff / vdivider;
			}
		}
	}
}

export { RideableCompUtils };