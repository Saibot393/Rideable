import { RideableCompUtils, cArmReach, cArmReachold } from "../compatibility/RideableCompUtils.js";
import { cWallHeight } from "../compatibility/RideableCompUtils.js";

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

export { cPf2eName, cModuleName, cPopUpID };

//a few support functions
class RideableUtils {
	//DECLARATIONS
	
	//Identification
	static isPf2e() {} //used for special Pf2e functions
	
	//Token IDs/Names
	static TokensfromIDs (pIDs, pScene = null) {} //returns an array of Tokens belonging to the pIDs
	
	static IDsfromTokens (pTokens) {} //returns an array of IDs belonging to the pTokens
	
	static TokenfromID (pID, pScene = null) {} //returnsthe Token matching pID
	
	//spawns
	static async SpawnableActors(pIdentifications) {} //returns an array of tokendocuments defined by their names or ids through pIdentifications and present in the actor tab
	
	static async SpawnTokens(pActors, pScene, px, py, pInfos = {}) {} //spawns tokens described by actors in array pActors to scene at position px, py
	
	static ignoreSpawn(pInfo) {} //returns if a spawn with this pInfo should be ignored by Rideable
	
	//Token Controls
	static selectedTokens() {} //get array of all selected tokens
	
	static targetedToken() {} //get first selected token
	
	static hoveredToken() {} //get first hovered token
	
	//Additional Token Infos
	static TokenissettingRideable(pToken) {} //returns if Token is rideable under current settings (related to settings)
	
	static TokencanRide(pToken) {} //returns if Token can Ride other Tokens (related to settings)
	
	static TokenisFamiliarof(pFamiliar, pMaster) {} //returns true of the deffinition of familiar is matched and both are controlled by current owner
	
	static areEnemies(pTokenA, pTokenB) {} //returns true if Tokens belong to oposing fractions (if one is neutral, always return true)
	
	static Ridingheight(pRidden) {} //returns the riding height of given token pRidden based on the settings [or based on the wall-height token height]
	
	static MountingDistance(pRider, pRidden) {} //returns the maximal Riding distance for pRider to mount pRidden
		
	static UserofCharacterID(pID) {} //returns all Users which has the character with pID set as their standard character (if any)
	
	//Pf2e specific
	static Ridingstring(pToken) {} //returns a string describing a Token being ridden by pToken
		
	static createRideEffect() {} //returns a prepared Ride Effects describing conected to pRiderToken
	
	//IMPLEMENTATIONS
	
	//Identification	
	static isPf2e() {
		return game.system.id === cPf2eName;
	}	
	
	//Token IDs/Names
	static TokensfromIDs (pIDs, pScene = null) {
		if (pScene) {
			return pScene.tokens.filter(vDocument => pIDs.includes(vDocument.id));
		}
		else {
			return canvas.tokens.placeables.filter(vToken => pIDs.includes(vToken.id)).map(vToken => vToken.document);
		}
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
	
	static TokenfromID (pID, pScene = null) {
		if (pScene) {
			let vDocument = pScene.tokens.find(vDocument => vDocument.id === pID);
			
			if (vDocument) {
				return vDocument;
			}
			else {
				return null;
			}
		}
		else {
			//default scene
			let vToken = canvas.tokens.placeables.find(vToken => vToken.id === pID);
			
			if (vToken) {
				return vToken.document;
			}
			else {
				return null;
			}
		}
	} 
	
	//spawns
	static async SpawnableActors(pIdentifications) {
		let vActors = [];
		
		for (let i = 0; i < pIdentifications.length; i++) {
			//world
			//-uuid
			let vBuffer = await game.actors.get(pIdentifications[i]);
			
			//-name
			if (!vBuffer) {
				vBuffer = await game.actors.find(vToken => vToken.name == pIdentifications[i]);
			}
			
			//direct id
			if (!vBuffer) {
				vBuffer = await fromUuid(pIdentifications[i]);
			}
			
			//compendium
			if (!vBuffer) {
				let vElement;
				let vPacks = game.packs.filter(vPacks => vPacks.documentName == "Actor");//.map(vPack => vPack.index);
				
				//-uuid
				let vPack = vPacks.find(vPack => vPack.index.get(pIdentifications[i]));
				
				if (vPack) {
					vElement = vPack.index.get(pIdentifications[i]);
				}
				else {//-name
					vPack = vPacks.find(vPack => vPack.index.find(vData => vData.name == pIdentifications[i]));
					
					if (vPack) {
						vElement = vPack.index.find(vData => vData.name == pIdentifications[i]);
					}
				}
			
				if (vElement) {
					vBuffer = await game.actors.filter(vToken => vToken.flags.core).find(vToken => vToken.flags.core.sourceId == "Compendium." + vPack.collection + ".Actor." + vElement._id);
					
					if (!vBuffer) {
						vBuffer = await game.actors.importFromCompendium(vPack, vElement._id);
					};
				}
			}
			
			if (vBuffer) {
				vActors[vActors.length] = vBuffer;
			}
		}
		
		return vActors;
	}
	
	static async SpawnTokens(pActors, pScene, px, py, pInfos = {}) {
		for (let i = 0; i < pActors.length; i++) {
			if (pActors[i]) {
				let vDocument = await pActors[i].getTokenDocument({x: px, y: py});
				
				await vDocument.constructor.create(vDocument, {parent: pScene, RideableSpawn: true, RideableInfos: pInfos});
			}
		}
	} 
	
	static ignoreSpawn(pInfo) {
		return RideableCompUtils.ignoreSpawn(pInfo);
	}
	
	//Token Controls
	static selectedTokens() {
		return canvas.tokens.controlled.map(pToken => pToken.document);
	}
	
	static targetedToken() {
		if (game.user.targets.ids.length) {
			return canvas.tokens.placeables.find(velement => velement.id === game.user.targets.ids[0]).document;
		}
		else {
			return null;
		}
	}
	
	static hoveredToken() {
		if (canvas.tokens.hover) {
			return canvas.tokens.hover.document;
		}
		else {
			return null;
		}
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
	
	static TokenisFamiliarof(pFamiliar, pMaster) {
		if ((pFamiliar) && (pMaster)) {
			if (pFamiliar.isOwner && pMaster.isOwner) {//check if both are owned
				if (RideableUtils.isPf2e()) { //Pf2e has familiars
					return ((pFamiliar.actor.type == cFamilarType) && ((pMaster.actor.type == cCharacterType) || (pMaster.actor.type == cNPCType)));//check if pFamiliar is of type familiar and pMaster is player character or npc
				}
				
				return ((pFamiliar.height < pMaster.height)||(pFamiliar.width < pMaster.width)); //check if pFamiliar is smaller then pMaster
			}
		}
		
		return false;
	} 
	
	static areEnemies(pTokenA, pTokenB) {
		if ((pTokenA) && (pTokenB)) {
			return ((pTokenA.disposition * pTokenB.disposition) < 0)
		}
		
		return false;
	}
	
	static Ridingheight(pRidden) {
		if (RideableCompUtils.isactiveModule(cWallHeight) && pRidden && game.settings.get(cModuleName, "useRiddenTokenHeight")) {
			return RideableCompUtils.guessWHTokenHeight(pRidden)
		}
		else {
			return game.settings.get(cModuleName, "RidingHeight");
		}
	} 
	
	static MountingDistance(pRider, pRidden) {
		if ((RideableCompUtils.isactiveModule(cArmReach) || RideableCompUtils.isactiveModule(cArmReachold)) && game.settings.get(cModuleName, "UseArmReachDistance")) {
			return RideableCompUtils.ARReachDistance();
		}
		
		if (game.settings.get(cModuleName, "MountingDistance") >= 0) {
			return game.settings.get(cModuleName, "MountingDistance");
		}
		else {
			return Infinity;
		}
	}
	
	static UserofCharacterID(pID) {
		return game.users.filter(vuser => vuser.character).filter(vuser => vuser.character.id == pID);
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

//for view switching
async function switchScene( {pUserID, pSceneID, px, py} = {}) {
	if ((game.user.id == pUserID) && (canvas.scene.id != pSceneID)) {
		//change only if intended user and not already on target scene
		
		await game.scenes.get(pSceneID).view();
		canvas.pan({ x: px, y: py });
	}
}

//Export RideableFlags Class
export{ RideableUtils, Translate, switchScene };
