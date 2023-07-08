//CONSTANTS
const cGradtoRad = Math.PI/180;

const cTokenFormCircle = "TokenFormCircle";
const cTokenFormRectangle = "TokenFormRectangle";

export {cTokenFormCircle, cTokenFormRectangle, cGradtoRad}

class GeometricUtils {
	//DECLARATIONS
	static Rotated(px, py, protation) {} //gives px, py rotated by protation[degrees]
	
	static CenterPosition(pToken) {} //returns the position of the Center of pToken
	
	static CenterPositionDocument(pDocument) {} //returns the position of the Center of pDocument (usefull for updates)
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static closestBorderposition(pToken, pTokenForm, pDirection) {} //gives the closest position on the border of pToken in directions of (x-y array) pDirection
	
	static withinBoundaries(pToken1, pTokenForm, pToken2) {} //if pToken2 is with in Boundaries of pToken1 (with form pTokenForm)
	
	//IMPLEMENTATIONS
	static Rotated(px, py, protation) {
		return [Math.cos(cGradtoRad * protation) * px - Math.sin(cGradtoRad * protation) * py, Math.sin(cGradtoRad * protation) * px + Math.cos(cGradtoRad * protation) * py];
	}
	
	static CenterPosition(pToken) {
		return [pToken.x + pToken.w/2, pToken.y + pToken.h/2];
	} 
	
	static CenterPositionDocument(pDocument) {
		return [pDocument.x + pToken.object.w/2, pDocument.y + pToken.object.h/2];
	}
	
	static TokenDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return Math.sqrt( ((pTokenA.x+pTokenA.w/2)-(pTokenB.x+pTokenB.w/2))**2 + ((pTokenA.y+pTokenA.h/2)-(pTokenB.y+pTokenB.h/2))**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
		}
		
		return 0;
	}
	
	static TokenBorderDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			let vDistance = GeometricUtils.TokenDistance(pTokenA, pTokenB) - (Math.max((pTokenA.w+pTokenB.w), (pTokenA.h+pTokenB.h))/2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
			
			if (vDistance < 0) {
				return 0;
			}
			else {
				return vDistance;
			}
		}
		
		return 0;
	}
	
	static closestBorderposition(pToken, pTokenForm, pDirection) {
		
	} 
	
	static withinBoundaries(pToken1, pTokenForm, pToken2) {
		
		switch (pTokenForm) {
			case cTokenFormCircle:
			
				return (GeometricUtils.TokenDistance(pToken1, pToken2) <= Math.max(pToken1.w, pToken1.h)/2);
				
				break;
			
			case cTokenFormCircle:
				let vPostion1 = GeometricUtils.CenterPosition(pToken1);
				let vPostion2 = GeometricUtils.CenterPosition(pToken1);
				
				return ((Math.abs(vPostion1[0] - vPostion2[0]) <= pToken1.w/2) && (Math.abs(vPostion1[1] - vPostion2[1]) <= pToken1.h/2));
			
				break;
				
			default:
				return false;
		}
	}
}

export { GeometricUtils }