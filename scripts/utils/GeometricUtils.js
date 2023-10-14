import * as FCore from "../CoreVersionComp.js";

import {RideableCompUtils, cTokenAttacher, cTokenFormAttachedTiles} from "../compatibility/RideableCompUtils.js";
import {RideableFlags} from "../helpers/RideableFlags.js";

//CONSTANTS
const cGradtoRad = Math.PI/180;

const chexfactor = Math.cos(30 * cGradtoRad);

const cxid = 0;
const cyid = 1;

const cAlphaTreshhold = 5;

//forms
const cTokenFormCircle = "TokenFormCircle";
const cTokenFormRectangle = "TokenFormRectangle";
const cTokenFormTransparency = "TokenTransparency";
const cTileFormNone = "TileFormNone";

const cTokenForms = [cTokenFormCircle, cTokenFormRectangle];
const cTileForms = [cTokenFormCircle, cTokenFormRectangle];

export {cTokenForms, cTileForms, cGradtoRad}

class GeometricUtils {
	//DECLARATIONS
	//basics
	static Rotated(pPosition, protation) {} //gives px, py rotated by protation[degrees]
	
	static CenterPosition(pToken, pTokenReplacementPosition = {}) {} //returns the position of the Center of pToken
	
	static CenterPositionXY(pToken) {} //returns the center position (x,y) of pToken
	
	static CentertoXY(pPoint, pToken) {} //maps a center point to a tl-corner point
	
	static CenterRoutetoXY(pRoute, pToken) {} //maps a center point route to a tl-corner point route
	
	static NewCenterPosition(pDocument, pChanges) {} //returns the new position of the Center of pDocument (usefull for updates)
	
	static Difference(pPositionA, pPositionB) {} //returns the x and y differenc of pPositionA to pPositionB (x-y arrays)
	
	static Summ(pPositionA, pPositionB) {} //returns the x and y summ of pPositionA to pPositionB (x-y arrays)
	
	static TokenDifference(pTokenA, pTokenB, pTokenAReplacementPosition = {}) {} //returns the x and y differenc of pTokenA to pTokenB (x-y arrays)
	
	static value(pVector) {} //returns the pythagoras value
	
	static scale(pNumberArray, pfactor) {} //scales pNumberarray by pfactor
	
	static scalexy(pNumberArray, pfactorarray) {} //scales pNumberarray by pfactorarray (position by position)
	
	static scaleto(pVector, pfactor) {} //scales pVector to pfactor length
	
	static scaletoxy(pVector, pfactorarray) {} //scales pVector to a new vector in the same direction but with pfactorarray as max value in x/y (ellipses)
	
	static norm(pVector) {} //returns pVector normed to 1
	
	static Direction(pPositionA, pPositionB) {} //returns (x-y array) with the relativ direction of pPositionA to pPositionB(normed to one)
	
	static Distance(pPositionA, pPositionB) {} //returns the distance between position A nad B
	
	static DistanceXY(pPositionA, pPositionB) {} //returns the distance between position A nad B (with A and B having x,y)
	
	static scaledDistance(pPositionA, pPositionB, pfactorarray, protation = 0) {} //returns the distance between position A nad B with the x and y component scaled with pfactorarray (rotates difference before claculation if protation != 0)
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenDistanceto(pToken, pPosition, pTokenReplacementPosition = {}) {} //returns the distance of pToken to pPosition
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static insceneWidth(pToken) {} //returns the tokens width in its scene
	
	static insceneHeight(pToken) {} //returns the tokens width in its scene
	
	static insceneSize(pToken) {} // returns the scene size of pTokens scene
	
	//sort
	static sortbymaxdim(pTokens) {} //sorts pTokens array by their largest dimensions, returns sorted array and array with their values
	
	//advanced
	static closestBorderposition(pToken, pTokenForm, pRider, pRiderReplacementPosition = {}) {} //gives the closest position on the border of pToken in directions of (x-y array) pDirection
	
	static withinBoundaries(pToken, pTokenForm, pPosition) {} //if pPosition is with in Boundaries of pToken (with form pTokenForm)
	
	//grids
	static GridSnap(ppositon, pGrid, podd = [0,0]) {}//snaps ppositon to grid, podd should be an array of boolean refering to x and y (e.g. if summ of rider and ridden size is odd)
	
	static GridSnapxy(pposition, pGrid) {} //snaps pposition(x,y) to grid type
	
	//graphics
	static Pixelsof(pObject) {} //returns the pixels of pObject
	
	static AlphaValue(pPosition, pPixelArray, pObject) {} //returns the Alpha value of Pixel at pPosition of pPixelArray with described size
	
	//IMPLEMENTATIONS
	//basics
	static Rotated(pPosition, protation) {
		return [Math.cos(cGradtoRad * protation) * pPosition[0] - Math.sin(cGradtoRad * protation) * pPosition[1], Math.sin(cGradtoRad * protation) * pPosition[0] + Math.cos(cGradtoRad * protation) * pPosition[1]];
	}
	
	static CenterPosition(pToken, pTokenReplacementPosition = {}) {
		if (pTokenReplacementPosition.hasOwnProperty("x") && pTokenReplacementPosition.hasOwnProperty("y")) {
			return [pTokenReplacementPosition.x + GeometricUtils.insceneWidth(pToken)/2, pTokenReplacementPosition.y + GeometricUtils.insceneHeight(pToken)/2];
		}
		else {
			return [pToken.x + GeometricUtils.insceneWidth(pToken)/2, pToken.y + GeometricUtils.insceneHeight(pToken)/2];
		}
	}

	static CenterPositionXY(pToken) {
		if (pToken) {
			return {x: pToken.x + GeometricUtils.insceneWidth(pToken)/2, y: pToken.y + GeometricUtils.insceneHeight(pToken)/2};
		}
		else {
			return {};
		}
	}
	
	static CentertoXY(pPoint, pToken) {
		if (pToken) {
			return {x: pPoint.x - GeometricUtils.insceneWidth(pToken)/2, y: pPoint.y - GeometricUtils.insceneHeight(pToken)/2};
		}
		else {
			return {};
		}		
	}
	
	static CenterRoutetoXY(pRoute, pToken) {
		let vWidthhalf = GeometricUtils.insceneWidth(pToken)/2;
		let vHeighthalf = GeometricUtils.insceneHeight(pToken)/2;
		
		return pRoute.map(vPoint => ({x: vPoint.x - vWidthhalf, y: vPoint.y - vHeighthalf}));
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
	
	static Summ(pPositionA, pPositionB) {
		return [pPositionA[0] + pPositionB[0], pPositionA[1] + pPositionB[1]];
	}
	
	static TokenDifference(pTokenA, pTokenB, pTokenAReplacementPosition = {}) {
		return GeometricUtils.Difference(GeometricUtils.CenterPosition(pTokenA, pTokenAReplacementPosition), GeometricUtils.CenterPosition(pTokenB));
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
	
	static DistanceXY(pPositionA, pPositionB) {
		return ((pPositionA.x - pPositionB.x)**2 + (pPositionA.y - pPositionB.y)**2)**0.5;
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
	
	static TokenDistanceto(pToken, pPosition, pTokenReplacementPosition = {}) {
		if (pToken) {
			if (pTokenReplacementPosition.hasOwnProperty("x") && pTokenReplacementPosition.hasOwnProperty("y")) {
				return Math.sqrt( ((pTokenReplacementPosition.x+GeometricUtils.insceneWidth(pToken)/2)-pPosition[0])**2 + ((pTokenReplacementPosition.y+GeometricUtils.insceneHeight(pToken)/2)-pPosition[1])**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
			}
			else {
				return Math.sqrt( ((pToken.x+GeometricUtils.insceneWidth(pToken)/2)-pPosition[0])**2 + ((pToken.y+GeometricUtils.insceneHeight(pToken)/2)-pPosition[1])**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
			}
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
		if (pToken.documentName == "Tile") {
			return pToken.width;
		}
		
		if (pToken.object) {
			return pToken.object.w;
		}
		else {
			return pToken.width * FCore.sceneof(pToken).dimensions.size;
		}
	}
	
	static insceneHeight(pToken) {		
		if (pToken.documentName == "Tile") {
			return pToken.height;
		}
		
		if (pToken.object) {
			return pToken.object.h;
		}
		else {
			return pToken.height * FCore.sceneof(pToken).dimensions.size;
		}
	}
	
	static insceneSize(pToken) {
		return FCore.sceneof(pToken).dimensions.size;
	}
	
	//sort
	static sortbymaxdim(pTokens) {
		let vsortedTokens = pTokens.sort(function(vTokena,vTokenb){return Math.max(vTokena.height, vTokena.width)-Math.max(vTokenb.height, vTokenb.width)});
		
		let vsortedmaxdim = vsortedTokens.map(vToken => Math.max(vToken.height, vToken.width));
		
		return [vsortedTokens, vsortedmaxdim];
	} 
	
	//advanced
	static closestBorderposition(pToken, pTokenForm, pRider, pRiderReplacementPosition = {}) {
		//unrotate direction to calculate relative position
		let vDirection;
		
		vDirection = GeometricUtils.Rotated(GeometricUtils.TokenDifference(pRider, pToken, pRiderReplacementPosition), -pToken.rotation);
		
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
				
			case cTokenFormTransparency:
				//jump empty distance
				let vStartingPosition = GeometricUtils.closestBorderposition(pToken, cTokenFormRectangle, pRider, pRiderReplacementPosition);
				
				if (!pToken.object.texture) {
					return vStartingPosition;
				}
				
				let vLength = GeometricUtils.value(vStartingPosition);
				
				let vPixels = GeometricUtils.Pixelsof(pToken);
				
				for (let i = Math.round(vLength); i > -vLength; i--) {
					let vPartLength = GeometricUtils.scale(vStartingPosition, i/vLength);
					
					if (GeometricUtils.AlphaValue(vPartLength, vPixels, pToken) > cAlphaTreshhold) {
						return vPartLength;
					}
				}
			
				return [0,0];
			case cTokenFormAttachedTiles:
				let vTiles = RideableCompUtils.TAAttachedTiles(pToken).filter(vTile => RideableFlags.TokenForm(vTile) != cTileFormNone);
				let vTileBorderPositions = vTiles.map(vTile => GeometricUtils.closestBorderposition(vTile, RideableFlags.TokenForm(vTile), pRider, pRiderReplacementPosition))
				
				if (vTiles.length > 0) {
					let vMinDistance = Infinity;
					let vMinDistancePosition = vTileBorderPositions[0];
					let vMinDistanceTile = vTiles[0];
					
					let vCurrentDistance;
					
					for (let i = 0; i < vTiles.length; i++) {
						vCurrentDistance = GeometricUtils.TokenDistanceto(pRider, GeometricUtils.Summ(GeometricUtils.CenterPosition(vTiles[i]), GeometricUtils.Rotated(vTileBorderPositions[i], vTiles[i].rotation)), pRiderReplacementPosition);					

						if (vCurrentDistance < vMinDistance) {
							vMinDistance = vCurrentDistance;
							
							vMinDistancePosition = vTileBorderPositions[i];
							vMinDistanceTile = vTiles[i];
						}
					}
					
					if (vMinDistance < Infinity) {
						//if not, something failed horrible
						return GeometricUtils.Summ(vMinDistancePosition, GeometricUtils.Rotated(GeometricUtils.TokenDifference(vMinDistanceTile, pToken), -pToken.rotation));
					}
				}
				
				return [0,0]; //if anything fails
			case cTileFormNone:
			default:
				return [0,0];
		}
	} 
	
	static withinBoundaries(pToken, pTokenForm, pPosition) {
		let vDifference;
		
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
				vDifference = GeometricUtils.Difference(GeometricUtils.CenterPosition(pToken), pPosition);
				
				vDifference = GeometricUtils.Rotated(vDifference, -pToken.rotation);
				
				return ((Math.abs(vDifference[0]) <= GeometricUtils.insceneWidth(pToken)/2) && (Math.abs(vDifference[1]) <= GeometricUtils.insceneHeight(pToken)/2));
			
				break;
				
			case cTokenFormTransparency:
				vDifference = GeometricUtils.Difference(GeometricUtils.CenterPosition(pToken), pPosition);
				
				vDifference = GeometricUtils.Rotated(vDifference, -pToken.rotation);
				
				if (!pToken.object.texture) {
					GeometricUtils.withinBoundaries(pToken, cTokenFormRectangle, pPosition); //probably monochromatic rectangle
				}
				
				//render texture
				let vpixels = GeometricUtils.Pixelsof(pToken);
				
				return GeometricUtils.AlphaValue(vDifference, vpixels, pToken) > cAlphaTreshhold;
			case cTokenFormAttachedTiles:
				return RideableCompUtils.TAAttachedTiles(pToken).find(vTile => GeometricUtils.withinBoundaries(vTile, RideableFlags.TokenForm(vTile), pPosition));
			case cTileFormNone:
			default:
				return false;
		}
	}
	
	//grids
	static GridSnap(ppositon, pGrid, podd = [0,0]) {
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
	
	static GridSnapxy(pposition, pGrid) {
		let vsnapposition = pposition;
		
		switch (pGrid.type) {
			case 0:
				//gridless
				return vsnapposition;
				break;
			
			case 1:
				//squares
				vsnapposition.x = Math.round(vsnapposition.x/pGrid.size)*pGrid.size;
				vsnapposition.y = Math.round(vsnapposition.y/pGrid.size)*pGrid.size;
				
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
	
	//graphics
	static Pixelsof(pObject) {
		let vsprite = new PIXI.Sprite(pObject.object.texture);
		let vtexture = PIXI.RenderTexture.create({width: vsprite.width, height: vsprite.height});
		
		canvas.app.renderer.render(vsprite, { renderTexture: vtexture });
		
		vsprite.destroy(false);
		
		let vpixels = canvas.app.renderer.extract.pixels(vtexture);		
		
		vtexture.destroy(true);
		
		return vpixels;
	}
	
	static AlphaValue(pPosition, pPixelArray, pObject) {	
		let vAlpha = 0;
		
		let vTexturex = Math.round((GeometricUtils.insceneWidth(pObject)/2 - pPosition[0]) / GeometricUtils.insceneWidth(pObject) * pObject.object.texture.width);
		
		let vTexturey = Math.round((GeometricUtils.insceneHeight(pObject)/2 - pPosition[1]) / GeometricUtils.insceneHeight(pObject) * pObject.object.texture.height);
		
		if ((vTexturex >= 0 && vTexturex < pObject.object.texture.width) && (vTexturey >= 0 && vTexturey < pObject.object.texture.height)) {
			vAlpha = pPixelArray[(vTexturey * pObject.object.texture.width + vTexturex)*4 + 3];
			
			if (vAlpha == undefined) {
				vAlpha = 0;
			}
		}
		
		return vAlpha;
	}
}

Hooks.once("ready", () => {
	if (FCore.Fversion() >= 11) {
		//only works in foundry 11 and higher
		cTokenForms.push(cTokenFormTransparency);
		cTileForms.push(cTokenFormTransparency);
		
		if (RideableCompUtils.isactiveModule(cTokenAttacher)) {
			//if token attacher is activated
			cTokenForms.push(cTokenFormAttachedTiles);
			
			cTileForms.push(cTileFormNone); //only has purpose with Token attacher
		}	
	}
});

export { GeometricUtils }