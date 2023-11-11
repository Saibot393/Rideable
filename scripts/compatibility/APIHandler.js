import {cModuleName} from "../utils/RideableUtils.js";
import {RideableFlags} from "../helpers/RideableFlags.js";
import {GeometricUtils} from "../utils/GeometricUtils.js";

function withinBoundaries (pObject, pObjectForm, pPosition) {
	//returns wether pPosition is within Boundaries of pObject with form pObjectForm("TokenFormCircle", "TokenFormRectangle", "TokenTransparency", "TokenFormAttachedTiles" (with token attacher))
	return GeometricUtils.withinBoundaries(pObject, pObjectForm, pPosition);
}

function RidingConnection(pObjecta, pObjectb, pSimple = false) {
	//returns wether pObject1, pObject2 are connected via RideableConnected
	if (pObjecta?.document && pObjectb?.document) {		
		return RideableFlags.RidingConnection(pObjecta.document, pObjectb.document, pSimple);
	}
	
	return false //if anything fails
}
	
Hooks.once("init", () => {
	game.modules.get(cModuleName).api = {
		RideableFlags,
		Geometrics : {
			withinBoundaries
		},
		RidingConnection
	}
});