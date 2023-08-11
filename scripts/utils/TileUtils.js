import { RideableFlags } from "../helpers/RideableFlags.js";
import { GeometricUtils, cGradtoRad } from "./GeometricUtils.js";

class TileUtils {
	//DECLARATIONS
	static hoveredRideableTile() {} //get highest (z-level) hovered Rideable tile
	
	static centerPosition(pTile) {} //returns the center position of pTile as array
	
	//IMPLEMENTATIONS
	static hoveredRideableTile() {
		let vvalidTiles = canvas.tiles.placeables.map(vTile => vTile.document).filter(vTile => vTile.visible && RideableFlags.TokenissetRideable(vTile));
		let vMousePosition = canvas.mousePosition;
		let vhoveredTile;
		
		vMousePosition = [vMousePosition.x, vMousePosition.y];
		
		if (vvalidTiles.length) {
			vvalidTiles = vvalidTiles.filter(vTile => GeometricUtils.withinBoundaries(vTile, RideableFlags.TokenForm(vTile), vMousePosition));	//filter tiles under mouse cursor
			vhoveredTile = vvalidTiles[0];
			
			if (vvalidTiles.length > 1) {		
				for (let i = 1; i < vvalidTiles.length; i++) {
					if (vvalidTiles[i].z > vhoveredTile.z) {
						vhoveredTile = vvalidTiles[i];
					}
				}
			}
			
			return vhoveredTile;
		}
		
		return;
	} 
	
	static centerPosition(pTile) {
		return [pTile.x + pTile.width/2, pTile.y + pTile.height/2]
	}
}

export { TileUtils }