//CONSTANTS
const cModuleName = "Rideable"; //name of Module
const cPf2eName = "pf2e"; //name of Pathfinder 2. edition system

const cRidingString = "Ridden by:"; //Ridingeffects will have a name consisting of this string followed by a space and the riding tokens name
const cRideableTag = "rideable"; //Rideable tokens need this tag if enabled (and system is Pf2e)

const cNPCType = "npc"; //type of npc tokens
const cCharacterType = "character"; //type of npc tokens
const cFamilarType = "familiar"; //type of familiar tokens (Pf2e)

const cRidingMovementTag = "RidingMovement"; //used to mark movement orders coming from the Riding script 


export { cPf2eName, cModuleName};

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
	static TokenisRideable(pToken) {} //returns if Token is rideable under current settings
	
	static TokencanRide(pToken) {} //returns if Token can Ride other Tokens
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static TokenisFamiliarof(pFamiliar, pMaster) {} //returns true of the deffinition of familiar is matched and both are controlled by current owner
	
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
	static TokenisRideable(pToken) {
		if (pToken) {
			switch (game.system.id) {
				case cPf2eName:
					if (game.settings.get(cModuleName, "RideableTag")) {
						if (pToken.actor.system.traits) {				
							return pToken.actor.system.traits.value.find(vElement => vElement.includes(cRideableTag));
						}
					}
					return true;
					
					break;
				default:
					return true;
			}
		}
		
		return false; 
	}
	
	static TokencanRide(pToken) {
		return true;
	}
	
	static TokenDistance(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return Math.sqrt( (pTokenA.x-pTokenB.x)**2 + (pTokenA.y-pTokenB.y)**2)/(canvas.scene.dimensions.size)*(canvas.scene.dimensions.distance);
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
		if (pFamiliar.isOwner && pMaster.isOwner) {//check if both are owned
			if (RideableUtils.isPf2e()) { //Pf2e has familiars
				return ((pFamiliar.actor.type == cFamilarType) && ((pMaster.actor.type == cCharacterType) || (pMaster.actor.type == cNPCType)));//check if pFamiliar is of type familiar and pMaster is player character or npc
			}
			
			return ((pFamiliar.h < pMaster.h)||(pFamiliar.w < pMaster.w)); //check if pFamiliar is smaller then pMaster
		}
		
		return false;
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
