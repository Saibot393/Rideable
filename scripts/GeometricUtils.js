//CONSTANTS
const cGradtoRad = Math.PI/180;

const cTokenFormCircle = "TokenFormCircle";
const cTokenFormRectangle = "TokenFormRectangle";

export {cTokenFormCircle, cTokenFormRectangle, cGradtoRad}

class GeometricUtils {
	//DECLARATIONS
	static Rotated(px, py, protation) {} //gives px, py rotated by protation[degrees]
	
	static closestBorderposition(pToken, pTokenForm, pDirection) {} //gives the closest position on the border of pToken in directions of (x-y array) pDirection
	
	//IMPLEMENTATIONS
	static Rotated(px, py, protation) {
		return [Math.cos(cGradtoRad * protation) * px - Math.sin(cGradtoRad * protation) * py, Math.sin(cGradtoRad * protation) * px + Math.cos(cGradtoRad * protation) * py];
	}
	
	static closestBorderposition(pToken, pTokenForm, pDirection) {
		
	} 
}

export { GeometricUtils }