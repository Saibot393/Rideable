//Module Names
const cStairways = "Stairways";
const cTagger = "tagger";
const cWallHeight = "wall-height";

export { cStairways, cTagger, cWallHeight }

//RideableCompUtil will take care of compatibility with other modules in regards to information handling, currently supported:

class RideableCompUtils {
	//DECLARATIONS
	//basic
	static isactiveModule(pModule) {}; //determines if module with id pModule is active
	
	//specific: Tagger
	static TokenHasTag(pToken, pTag) {};//[Tagger] looks up Tags of pToken and returns true if tags contain pTag
	
	//IMPLEMENTATIONS
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
}

export { RideableCompUtils };