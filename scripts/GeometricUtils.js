import * as FCore from "./CoreVersionComp.js";

//CONSTANTS
const cGradtoRad = Math.PI/180;

const chexfactor = Math.cos(30 * cGradtoRad);

const cxid = 0;
const cyid = 1;

const cTokenFormCircle = "TokenFormCircle";
const cTokenFormRectangle = "TokenFormRectangle";

export {cTokenFormCircle, cTokenFormRectangle, cGradtoRad}

class GeometricUtils {
	//DECLARATIONS
	//basics
	static Rotated(pPosition, protation) {} //gives px, py rotated by protation[degrees]
	
	static CenterPosition(pToken) {} //returns the position of the Center of pToken
	
	static NewCenterPosition(pDocument, pChanges) {} //returns the new position of the Center of pDocument (usefull for updates)
	
	static Difference(pPositionA, pPositionB) {} //returns the x and y differenc of pPositionA to pPositionB (x-y arrays)
	
	static TokenDifference(pTokenA, pTokenB) {} //returns the x and y differenc of pTokenA to pTokenB (x-y arrays)
	
	static value(pVector) {} //returns the pythagoras value
	
	static scale(pNumberArray, pfactor) {} //scales pNumberarray by pfactor
	
	static scalexy(pNumberArray, pfactorarray) {} //scales pNumberarray by pfactorarray (position by position)
	
	static scaleto(pVector, pfactor) {} //scales pVector to pfactor length
	
	static scaletoxy(pVector, pfactorarray) {} //scales pVector to a new vector in the same direction but with pfactorarray as max value in x/y (ellipses)
	
	static norm(pVector) {} //returns pVector normed to 1
	
	static Direction(pPositionA, pPositionB) {} //returns (x-y array) with the relativ direction of pPositionA to pPositionB(normed to one)
	
	static Distance(pPositionA, pPositionB) {} //returns the distance between position A nad B
	
	static scaledDistance(pPositionA, pPositionB, pfactorarray, protation = 0) {} //returns the distance between position A nad B with the x and y component scaled with pfactorarray (rotates difference before claculation if protation != 0)
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static insceneWidth(pToken) {} //returns the tokens width in its scene
	
	static insceneHeight(pToken) {} //returns the tokens width in its scene
	
	//advanced
	static closestrelativBorderposition(pToken, pTokenForm, pDirection) {} //gives the closest position on the border of pToken in directions of (x-y array) pDirection
	
	static withinBoundaries(pToken, pTokenForm, pPosition) {} //if pPosition is with in Boundaries of pToken (with form pTokenForm)
	
	//grids
	static GridSnap(ppositon, pGridType, podd) {}//snaps ppositon to grid, podd should be an array of boolean refering to x and y (e.g. if summ of rider and ridden size is odd)
	
	//IMPLEMENTATIONS
	//basics
	static Rotated(pPosition, protation) {
		return [Math.cos(cGradtoRad * protation) * pPosition[0] - Math.sin(cGradtoRad * protation) * pPosition[1], Math.sin(cGradtoRad * protation) * pPosition[0] + Math.cos(cGradtoRad * protation) * pPosition[1]];
	}
	
	static CenterPosition(pToken) {
		return [pToken.x + GeometricUtils.insceneWidth(pToken)/2, pToken.y + GeometricUtils.insceneHeight(pToken)/2];
	} 
	
	static NewCenterPosition(pDocument, pChanges) {
		let vPosition = [GeometricUtils.insceneWidth(pDocument)/2, GeometricUtils.insceneHeight(pDocument)/2];
		
		if (pChanges.hasOwnProperty("x")) {
			vPosition[0] = vPosition[0] + pChanges.x;
		}
		else {
			vPosition[0] = vPosition[0] + pDocument.x;
		}
		
		if (pChanges.hasOwnProperty("y")) {
			vPosition[1] = vPosition[1] + pChanges.y;
		}
		else {
			vPosition[1] = vPosition[1] + pDocument.y;
		}
		
		return vPosition;
	}
	
	static Difference(pPositionA, pPositionB) {
		return [pPositionA[0] - pPositionB[0], pPositionA[1] - pPositionB[1]];
	} 
	
	static TokenDifference(pTokenA, pTokenB) {
		return GeometricUtils.Difference(GeometricUtils.CenterPosition(pTokenA), GeometricUtils.CenterPosition(pTokenB));
	}
	
	static value(pVector) {
		return Math.sqrt(pVector[0] ** 2 + pVector[1] ** 2);
	} 
	
	static scale(pNumberArray, pfactor) {
		return pNumberArray.map(pValue => pValue*pfactor);
	} 
	
	static scalexy(pNumberArray, pfactorarray) {
		return [pNumberArray[0] * pfactorarray[0], pNumberArray[1] * pfactorarray[1]];
	} 
	
	static scaleto(pVector, pfactor) {
		return GeometricUtils.scale(pVector, pfactor/GeometricUtils.value(pVector));
	}
	
	static scaletoxy(pVector, pfactorarray) {
		return GeometricUtils.scalexy(GeometricUtils.norm(GeometricUtils.scalexy(pVector, pfactorarray.map(vvalue => 1/vvalue))),pfactorarray);
	} 
	
	static norm(pVector) {
		return GeometricUtils.scaleto(pVector, 1);
	} 
	
	static Direction(pPositionA, pPositionB) {
		let vDifference = GeometrixUtils.Difference(pPositionA, pPositionB);
		
		return GeometrixUtils.scale(vDifference, 1/GeometrixUtils.value(vDifference));
	}
	
	static Distance(pPositionA, pPositionB) {
		return GeometricUtils.value(GeometricUtils.Difference(pPositionA, pPositionB));
	}
	
	static scaledDistance(pPositionA, pPositionB, pfactorarray, protation = 0) {
		if (!protation) {
			return GeometricUtils.value(GeometricUtils.scalexy(GeometricUtils.Difference(pPositionA, pPositionB), pfactorarray));
		}
		else {
			return GeometricUtils.value(GeometricUtils.scalexy(GeometricUtils.Rotated(GeometricUtils.Difference(pPositionA, pPositionB), protation), pfactorarray));
		}
	} 
	
	static TokenDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return Math.sqrt( ((pTokenA.x+GeometricUtils.insceneWidth(pTokenA)/2)-(pTokenB.x+GeometricUtils.insceneWidth(pTokenB)/2))**2 + ((pTokenA.y+GeometricUtils.insceneHeight(pTokenA)/2)-(pTokenB.y+GeometricUtils.insceneHeight(pTokenB)/2))**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
		}
		
		return 0;
	}
	
	static TokenBorderDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			let vDistance = GeometricUtils.TokenDistance(pTokenA, pTokenB) - (Math.max((GeometricUtils.insceneWidth(pTokenA)+GeometricUtils.insceneWidth(pTokenB)), (GeometricUtils.insceneHeight(pTokenA)+GeometricUtils.insceneHeight(pTokenB)))/2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
			
			if (vDistance < 0) {
				return 0;
			}
			else {
				return vDistance;
			}
		}
		
		return 0;
	}
	
	static insceneWidth(pToken) {
		if (pToken.object) {
			return pToken.object.w;
		}
		else {
			return pToken.width * FCore.sceneof(pToken).dimensions.size;
		}
	}
	
	static insceneHeight(pToken) {
		if (pToken.object) {
			return pToken.object.h;
		}
		else {
			return pToken.height * FCore.sceneof(pToken).dimensions.size;
		}
	}
	
	//advanced
	static closestBorderposition(pToken, pTokenForm, pDirection) {
		//unrotate direction to calculate relative position
		let vDirection = GeometricUtils.Rotated(pDirection, -pToken.rotation);
		
		switch (pTokenForm) {
			case cTokenFormCircle:
				if (Math.max(GeometricUtils.insceneWidth(pToken) == GeometricUtils.insceneHeight(pToken))) {
					return (GeometricUtils.scaleto(vDirection, Math.max(GeometricUtils.insceneWidth(pToken))/2));
				}
				else {				
					//supports ellipses through scaling
					return GeometricUtils.scaletoxy(vDirection, [GeometricUtils.insceneWidth(pToken)/2, GeometricUtils.insceneHeight(pToken)/2]);
				}
				
				break;
			
			case cTokenFormRectangle:
				let vTarget = [0, 0];
				
				//calculate if position is on x or y border (x-Border : Left/Right, y-Border:Top/Bottom
				let vxBorder = (Math.abs(vDirection[0]) / GeometricUtils.insceneWidth(pToken) > Math.abs(vDirection[1]) / GeometricUtils.insceneHeight(pToken));
				
				if (vxBorder) {
					vTarget[0] = Math.sign(vDirection[0]) * GeometricUtils.insceneWidth(pToken)/2;

					vTarget[1] = vDirection[1]/vDirection[0] * vTarget[0];
				}
				else {
					vTarget[1] = Math.sign(vDirection[1]) * GeometricUtils.insceneHeight(pToken)/2;
					
					vTarget[0] = vDirection[0]/vDirection[1] * vTarget[1];
				}
				
				return vTarget;
			
				break;
				
			default:
				return [0,0];
		}
	} 
	
	static withinBoundaries(pToken, pTokenForm, pPosition) {
		
		switch (pTokenForm) {
			case cTokenFormCircle:
				if (Math.max(GeometricUtils.insceneWidth(pToken) == GeometricUtils.insceneHeight(pToken))) {
					return (GeometricUtils.Distance(GeometricUtils.CenterPosition(pToken), pPosition) <= Math.max(GeometricUtils.insceneWidth(pToken))/2);
				}
				else {	
					//supports ellipses through scaling
					return (GeometricUtils.scaledDistance(GeometricUtils.CenterPosition(pToken), pPosition, [1/GeometricUtils.insceneWidth(pToken), 1/GeometricUtils.insceneHeight(pToken)], -pToken.rotation) <= 1/2);
				}
				
				break;
			
			case cTokenFormRectangle:
				let vDifference = GeometricUtils.Difference(GeometricUtils.CenterPosition(pToken), pPosition);
				
				vDifference = GeometricUtils.Rotated(vDifference, -pToken.rotation);
				
				return ((Math.abs(vDifference[0]) <= GeometricUtils.insceneWidth(pToken)/2) && (Math.abs(vDifference[1]) <= GeometricUtils.insceneHeight(pToken)/2));
			
				break;
				
			default:
				return false;
		}
	}
	
	//grids
	static GridSnap(ppositon, pGrid, podd) {
		let vsnapposition = [0,0];
		//podd: depends on refrence point, if corner => podd == false, if middle => podd == true
		switch (pGrid.type) {
			case 0:
				//gridless
				return ppositon;
				break;
			
			case 1:
				//squares
				let voffset = 0;
				
				for (let dim = cxid; dim <= cyid; dim++) {
					if (podd && podd[dim]) {
						voffset = pGrid.size/2;
					}
					
					vsnapposition[dim] = Math.sign(ppositon[dim]) * (Math.round((Math.abs(ppositon[dim])-voffset-1)/pGrid.size) * pGrid.size + voffset);
				}
				
				return vsnapposition;
				break;
			
			case 2:
				/*
				let vgridheight = Math.round(chexfactor*pGrid.size+0.5);
				
				console.log(podd);
				
				let vyoffset = 0;
				if (podd && podd[cyid]) {
					vyoffset = vgridheight/2;
				}	
				
				vsnapposition[cyid] = Math.sign(ppositon[cyid]) * (Math.round((Math.abs(ppositon[cyid])-vyoffset)/(vgridheight)-0.5) * vgridheight + vyoffset);
				
				//Check
				
				let vxoffset = 0;		
				
				if (podd && podd[cxid]) {
					vxoffset = vxoffset + pGrid.size/2;
				}		
				
				if (((podd && podd[cxid]) && (Math.round(vsnapposition[cyid]/vgridheight+0.5)%2)) || (!(podd && podd[cxid]) && !(Math.round(vsnapposition[cyid]/vgridheight+0.5)%2))) {
					vxoffset = vxoffset + pGrid.size/2;
				}	

				console.log((Math.abs(ppositon[cxid])-vxoffset)/pGrid.size);
				console.log(Math.round((Math.abs(ppositon[cxid])-vxoffset)/pGrid.size-0.5));
				console.log(Math.round((Math.abs(ppositon[cxid])-vxoffset)/pGrid.size-0.5) * pGrid.size + vxoffset);
				vsnapposition[cxid] = Math.sign(ppositon[cxid]) * (Math.round((Math.abs(ppositon[cxid])-vxoffset)/pGrid.size-0.5) * pGrid.size + vxoffset);
				console.log(vsnapposition[cxid]);
				
				return vsnapposition;
				*/
			//add cases for grids(later)
			default:
				return vsnapposition;
		}
	}
}

export { GeometricUtils }