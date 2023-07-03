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

//limits
const cCornermaxRiders = 4; //4 corners

export { cPf2eName, cModuleName, cCornermaxRiders};

//a few support functions
class RideableUtils {
	//DECLARATIONS
	
	//Identification
	static isPf2e() {} //used for special Pf2e functions
	
	//Modules
	static isactiveModule(pModule) {};
	
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
	
	static TokenhasRidingPlace(pToken, pFamiliars = false) {} //returns if pToken has Riding places left
	
	static TokenDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens
	
	static TokenBorderDistance(pTokenA, pTokenB) {} //returns (in game) Distance between Tokens from their respective borders
	
	static TokenisFamiliarof(pFamiliar, pMaster) {} //returns true of the deffinition of familiar is matched and both are controlled by current owner
	
	static areEnemies(pTokenA, pTokenB) {} //returns true if Tokens belong to oposing fractions (if one is neutral, always return true)
	
	//Pf2e specific
	static Ridingstring(pToken) {} //returns a string describing a Token being ridden by pToken
		
	static createRideEffect() {} //returns a prepared Ride Effects describing conected to pRiderToken
	
	//Additional UI
	
	static TextPopUp(pToken, pText, pWords = {}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static TextPopUpID(pToken, pID, pWords = {}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static PopUpRequest(pTokenID, pText) {} //handels socket calls for pop up texts
	//IMPLEMENTATIONS
	
	//Identification	
	static isPf2e() {
		return game.system.id === cPf2eName;
	}
	
	//Modules
	static isactiveModule(pModule) {
		if (game.modules.find(vModule => vModule.id == pModule)) {
			return game.modules.find(vModule => vModule.id == pModule).active;
		}
		
		return false;
	};
	
	
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
	
	static TokenhasRidingPlace(pToken, pFamiliars = false) {
		if (pFamiliars) {
			return (RideableFlags.RiderFamiliarCount(pToken) < cCornermaxRiders);
		}
		
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

	//Additional UI
	
	static TextPopUp(pToken, pText, pWords = {}) {
		let vText = pText;
		
		for (let vWord of Object.keys(pWords)) {
			vText = vText.replace("{" + vWord + "}", pWords[vWord]);
		}
		
		//other clients pop up
		game.socket.emit("module.Rideable", {pFunction : "PopUpRequest", pData : {pTokenID: pToken.id, pText : vText}});
		
		//own pop up
		RideableUtils.PopUpRequest(pToken.id, vText);
	}
	
	static TextPopUpID(pToken, pID, pWords = {}) {
		RideableUtils.TextPopUp(pToken, Translate(cPopUpID+"."+pID), pWords)
	} 
	
	static PopUpRequest(pTokenID, pText) {
		if (game.settings.get(cModuleName, "MessagePopUps")) {
			let vToken = RideableUtils.TokenfromID(pTokenID);
			
			if (vToken) {
				canvas.interface.createScrollingText(vToken, pText, {x: vToken.x, y: vToken.y, text: pText, anchor: CONST.TEXT_ANCHOR_POINTS.TOP, fill: "#FFFFFF", stroke: "#FFFFFF"});
			}
		}
	}
}

//for easy translation
function Translate(pName){
  return game.i18n.localize(cModuleName+"."+pName);
}

//Export RideableFlags Class
function PopUpRequest({ pTokenID, pText } = {}) { return RideableUtils.PopUpRequest(pTokenID, pText); }

export{ RideableUtils, PopUpRequest, Translate };
