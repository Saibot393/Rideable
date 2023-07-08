import { RideableCompUtils, cArmReach } from "./RideableCompUtils.js";
import { cWallHeight } from "./RideableCompUtils.js";

//CONSTANTS
const cModuleName = "Rideable"; //name of Module

const cPopUpID = "Popup";

//System names
const cPf2eName = "pf2e"; //name of Pathfinder 2. edition system

//Riding names
const cRidingString = "Ridden by:"; //Ridingeffects will have a name consisting of this string followed by a space and the riding tokens name
const cRideableTag = "rideable"; //Rideable tokens need this tag if enabled (and system is Pf2e)
const cRidingMovementTag = "RidingMovement"; //used to mark movement orders coming from the Riding script 

//type names
const cNPCType = "npc"; //type of npc tokens
const cCharacterType = "character"; //type of npc tokens
const cFamilarType = "familiar"; //type of familiar tokens (Pf2e)

const cTokenFormC = "TokenFormCircle";
const cTokenFormR = "TokenFormRectangle";

export { cPf2eName, cModuleName, cPopUpID };

//a few support functions
class RideableUtils {
	//DECLARATIONS
	
	//Identification
	static isPf2e() {} //used for special Pf2e functions
	
	//Token IDs
	static TokensfromIDs (pIDs) {} //returns an array of Tokens belonging to the pIDs
	
	static IDsfromTokens (pTokens) {} //returns an array of IDs belonging to the pTokens
	
	static TokenfromID (pID) {} //returnsthe Token matching pID
	
	//Token Controls
	static selectedTokens() {} //get array of all selected tokens
	
	static targetedToken() {} //get first selected token
	
	static hoveredToken() {} //get first hovered token
	
	//Additional Token Infos
	static TokenissettingRideable(pToken) {} //returns if Token is rideable under current settings (related to settings)
	
	static TokencanRide(pToken) {} //returns if Token can Ride other Tokens (related to settings)
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static TokenisFamiliarof(pFamiliar, pMaster) {} //returns true of the deffinition of familiar is matched and both are controlled by current owner
	
	static areEnemies(pTokenA, pTokenB) {} //returns true if Tokens belong to oposing fractions (if one is neutral, always return true)
	
	static Ridingheight(pRidden) {} //returns the riding height of given token pRidden based on the settings [or based on the wall-height token height]
	
	static MountingDistance(pRider, pRidden) {} //returns the maximal Riding distance for pRider to mount pRidden
	
	//Pf2e specific
	static Ridingstring(pToken) {} //returns a string describing a Token being ridden by pToken
		
	static createRideEffect() {} //returns a prepared Ride Effects describing conected to pRiderToken
	
	//IMPLEMENTATIONS
	
	//Identification	
	static isPf2e() {
		return game.system.id === cPf2eName;
	}	
	
	//Token IDs
	static TokensfromIDs (pIDs) {
		return canvas.tokens.placeables.filter(vToken => pIDs.includes(vToken.id));
	}
	
	static IDsfromTokens (pTokens) {
		let vIDs = [];
					
		for (let i = 0; i < pTokens.length; i++) {
			let vBuffer = null;
			
			if (pTokens[i]) {
				vIDs[vIDs.length] = pTokens[i].id;
			}
		}
		
		return vIDs;
	}
	
	static TokenfromID (pID) {
		return canvas.tokens.placeables.find(vToken => vToken.id === pID);
	} 
	
	//Token Controls
	static selectedTokens() {
		return canvas.tokens.controlled;
	}
	
	static targetedToken() {
		return canvas.tokens.placeables.find(velement => velement.id === game.user.targets.ids[0]);
	}
	
	static hoveredToken() {
		return canvas.tokens.hover;
	}
		
	//Additional Token Infos
	static TokenissettingRideable(pToken) {
		if (pToken) {
			if (game.settings.get(cModuleName, "RideableTag")) {
				switch (game.system.id) {
					case cPf2eName:
						if (pToken.actor.system.traits) {						
							return Boolean(pToken.actor.system.traits.value.find(vElement => vElement.includes(cRideableTag)));
						}
						
						break;
					default:
						return false;
				}
			}
		}
		
		return false; 
	}
	
	static TokencanRide(pToken) {
		return true;
	}
	
	static TokenDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return Math.sqrt( ((pTokenA.x+pTokenA.w/2)-(pTokenB.x+pTokenB.w/2))**2 + ((pTokenA.y+pTokenA.h/2)-(pTokenB.y+pTokenB.h/2))**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
		}
		
		return 0;
	}
	
	static TokenBorderDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			let vDistance = RideableUtils.TokenDistance(pTokenA, pTokenB) - (Math.max((pTokenA.w+pTokenB.w), (pTokenA.h+pTokenB.h))/2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
			
			if (vDistance < 0) {
				return 0;
			}
			else {
				return vDistance;
			}
		}
		
		return 0;
	}
	
	static TokenisFamiliarof(pFamiliar, pMaster) {
		if ((pFamiliar) && (pMaster)) {
			if (pFamiliar.isOwner && pMaster.isOwner) {//check if both are owned
				if (RideableUtils.isPf2e()) { //Pf2e has familiars
					return ((pFamiliar.actor.type == cFamilarType) && ((pMaster.actor.type == cCharacterType) || (pMaster.actor.type == cNPCType)));//check if pFamiliar is of type familiar and pMaster is player character or npc
				}
				
				return ((pFamiliar.h < pMaster.h)||(pFamiliar.w < pMaster.w)); //check if pFamiliar is smaller then pMaster
			}
		}
		
		return false;
	} 
	
	static areEnemies(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return ((pTokenA.document.disposition * pTokenB.document.disposition) < 0)
		}
		
		return false;
	}
	
	static Ridingheight(pRidden) {
		if (RideableCompUtils.isactiveModule(cWallHeight) && pRidden && game.settings.get(cModuleName, "useRiddenTokenHeight")) {
			return RideableCompUtils.WHTokenHeight(pRidden)
		}
		else {
			return game.settings.get(cModuleName, "RidingHeight");
		}
	} 
	
	static MountingDistance(pRider, pRidden) {
		if (RideableCompUtils.isactiveModule(cArmReach) && game.settings.get(cModuleName, "UseArmReachDistance")) {
			return game.settings.get(cArmReach, "globalInteractionMeasurement");
		}
		else {
			if (game.settings.get(cModuleName, "MountingDistance") >= 0) {
				return game.settings.get(cModuleName, "MountingDistance");
			}
			else {
				return Infinity;
			}
		}
	}
	
	//Pf2e specific
	static Ridingstring(pToken) {
		if (pToken) {
			return cRidingString + " " + pToken.name;
		}
		else {
			return cRidingString;
		}
	}
	
	
	static createRideEffect() {
		//pTarget.actor.createEmbeddedDocuments("Item", vRideeffects);
		if (RideableUtils.isPf2e()) {
			return {
				type: "effect",
				name: "name", //localize('.nameOfQuickUntitledEffect'),
				img: "systems/pf2e/icons/equipment/worn-items/companion-items/barding-of-the-zephyr.webp",
				data: {
				  tokenIcon: { show: true },
				  duration: {
					value: 1,
					unit: "unlimited",
					sustained: false,
					expiry: "turn-start"
				  },
				  description: {
					value: "some description",
				  },
				  unidentified: false,
				  traits: {
					custom: "",
					rarity: "common",
					value: []
				  },
				  level: {
					value: 0
				  },
				  source: {
					value: ""
				  }
				},
				flags: {}
			}
		}
	}
}

//for easy translation
function Translate(pName){
  return game.i18n.localize(cModuleName+"."+pName);
}

//Export RideableFlags Class
export{ RideableUtils, Translate };
