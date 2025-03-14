import { RideableCompUtils, cArmReach, cArmReachold, cTokenAttacher, cTokenFormAttachedTiles } from "../compatibility/RideableCompUtils.js";
import { cWallHeight } from "../compatibility/RideableCompUtils.js";
import { GeometricUtils } from "./GeometricUtils.js";
import { TileUtils } from "./TileUtils.js";
import { RideableFlags} from "../helpers/RideableFlags.js";

//CONSTANTS
const cModuleName = "Rideable"; //name of Module

const cPopUpID = "Popup";

const cDelimiter = ";";

//System names
const cPf2eName = "pf2e"; //name of Pathfinder 2. edition system

//Riding names
const cRidingString = "Ridden by:"; //Ridingeffects will have a name consisting of this string followed by a space and the riding tokens name
const cRideableTag = "rideable"; //Rideable tokens need this tag if enabled (and system is Pf2e)
const cRidingMovementTag = "RidingMovement"; //used to mark movement orders coming from the Riding script

//for quantity paths
const cQuantity = "quantity"; //name of the quantity attribut of items in most systems
const cValue = "value"; //name of the value attribute some quantity attributes have

//type names
const cNPCType = "npc"; //type of npc tokens
const cCharacterType = "character"; //type of npc tokens
const cFamilarType = "familiar"; //type of familiar tokens (Pf2e)

const cPf2EffectType = "effect"; //the item type of Pf2e effects
const cPf2ConditionType = "condition"; //the item type of Pf2e conditions

const cMovementKeys = ["movement", "speed"];

export { cPf2eName, cModuleName, cPopUpID, cDelimiter };

var vlastSearchedItemtype; //Saves the last item type for which a path was searched
var vlastItempath; //Saves the last path that was found for lastSearchedItemtype

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
	static async SpawnableActors(pIdentifications) {} //returns an array of tokendocuments defined by their names or ids through pIdentifications and present the compendium or actors tab
	
	static async SpawnTokens(pActors, pScene, px, py, pInfos = {}) {} //spawns tokens described by actors in array pActors to scene at position px, py
	
	static ignoreSpawn(pInfo) {} //returns if a spawn with this pInfo should be ignored by Rideable
	
	//Token Controls
	static selectedTokens() {} //get array of all selected tokens
	
	static targetedToken() {} //get first selected token
	
	static targetedTokens() {} //get first selected token
	
	static hoveredToken() {} //get first hovered token
	
	static hoveredRideableToken() {} //get the first hovered token or the first proxy hovered token
	
	static getRiderMovementsetting() {} //returns the setting belonging to the RiderMovement setting of the player
	
	//Additional Token Infos
	static issettingMountableandUn(pToken, pPopup = false) {} //returns if Token is rideable under current settings (related to settings)
	
	static TokenissettingunRideable(pToken, pPopup = false) {} //returns if Token is currently prevented from being ridden
	
	static TokencanRide(pToken) {} //returns if Token can Ride other Tokens (related to settings)
	
	static TokenisFamiliarof(pFamiliar, pMaster) {} //returns true of the deffinition of familiar is matched and both are controlled by current owner
	
	static areEnemies(pTokenA, pTokenB) {} //returns true if Tokens belong to oposing fractions (if one is neutral, always return true)
	
	static Ridingheight(pRidden) {} //returns the riding height of given token pRidden based on the settings [or based on the wall-height token height]
	
	static MountingDistance() {} //returns the maximal Riding distance
	
	static WithinMountingDistance(pRider, pRidden, pCustomDistance = null) {} //returns if pRider is close enought to pRidden to mount
		
	static UserofCharacterID(pID) {} //returns all Users which has the character with pID set as their standard character (if any)
	
	static isConnected(pToken, pObject) {} //returns of pObject is connected to pToken
	
	static canbeMoved(pObject) {} //returns if pObject can be moved
	
	static async totalWeight(pToken) {} //tries to work out the total weight of a token in game units
	
	static async ItemQuantityPath(pItem, pItemtype = "", pSearchDepth = 10) {} //returns the path to the items quantity in form of an array ([] if no path found)
	
	static setItemquantity(pItem, pset, pCharacter = undefined) {} //trys to set quantity of pItem to pset
	
	static async getItemquantity(pItem, pPath = []) {} //trys to get quantity of pItem, returns 0 otherwise
	
	static MovementEffectOverrides(pToken) {} //returns an array containing flags, modes, and values to override movement values in an effect
	
	//support
	static CompleteProperties(pProperties, pSource1, pSource2) {} //returns an object containing properties defined in pProperties, first filled with pSource1, then with pSource2
	
	//Pf2e specific
	static Ridingstring(pToken) {} //returns a string describing a Token being ridden by pToken
		
	static async ApplicableEffects(pIdentifications) {} //returns an array of tokendocuments defined by their names or ids through pIdentifications and present in the compendium or items tab
	
	static CustomWorldRidingEffects() {} //returns all World setting Riding effects
	
	static CustomWorldGrapplingEffects() {} //returns all World setting Grappling effects
	
	//IMPLEMENTATIONS
	
	//Identification	
	static isPf2e() {
		return game.system.id === cPf2eName;
	}	
	
	//Token IDs/Names
	static TokensfromIDs (pIDs, pScene = null) {
		if (pScene) {
			return pScene.tokens.filter(vDocument => pIDs.includes(vDocument.id)).concat(pScene.tiles.filter(vDocument => pIDs.includes(vDocument.id)));
		}
		else {
			return canvas.tokens.placeables.filter(vToken => pIDs.includes(vToken.id)).map(vToken => vToken.document).concat(canvas.tiles.placeables.filter(vToken => pIDs.includes(vToken.id)).map(vToken => vToken.document));;
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
			
			if (!vDocument) {
				vDocument = pScene.tiles.find(vDocument => vDocument.id === pID);
			}
			
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
			
			if (!vToken) {
				vToken = canvas.tiles.placeables.find(vToken => vToken.id === pID);
			}
			
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
	
	static targetedTokens() {
		if (game.user.targets.ids.length) {
			return canvas.tokens.placeables.filter(velement => game.user.targets.ids.includes(velement.id)).map(vToken => vToken.document);
		}
		else {
			return [];
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
	
	static hoveredRideableToken() {
		let vHovered = RideableUtils.hoveredToken();
		
		if (!vHovered) {
			vHovered = TileUtils.hoveredProxyToken();
		}
		
		return vHovered;
	}
	
	static getRiderMovementsetting() {
		switch (game.settings.get(cModuleName, "RiderMovement")) {
			case "RiderMovement-worlddefault":
				return game.settings.get(cModuleName, "RiderMovementworlddefault");
				break;
			default:
				return game.settings.get(cModuleName, "RiderMovement");
		}
	} 
		
	//Additional Token Infos
	static TokenissettingRideable(pToken, pPopup = false) {
		if (pToken) {		
			if (game.settings.get(cModuleName, "RideableTag")) {
				switch (game.system.id) {
					case cPf2eName:
						if (pToken?.actor?.system.traits) {						
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
	
	static issettingMountableandUn(pToken, pPopup = false) {
		return RideableCompUtils.issettingMountableandUn(pToken, pPopup);
	}
	
	static TokencanRide(pToken) {
		return true;
	}
	
	static TokenisFamiliarof(pFamiliar, pMaster) {
		if ((pFamiliar) && (pMaster)) {
			if (pFamiliar.isOwner && pMaster.isOwner) {//check if both are owned
				return true; //ship other checks, no longer necessary
			
				if (RideableUtils.isPf2e()) { //Pf2e has familiars
					return ((pFamiliar.actor.type == cFamilarType) && ((pMaster.actor.type == cCharacterType) || (pMaster.actor.type == cNPCType)));//check if pFamiliar is of type familiar and pMaster is player character or npc
				}
				console.log(((pFamiliar.height < pMaster.height)||(pFamiliar.width < pMaster.width)));
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
		if (RideableCompUtils.isactiveModule(cWallHeight) && pRidden && game.settings.get(cModuleName, "useRiddenTokenHeight") && (pRidden.documentName == "Token")) {
			return RideableCompUtils.guessWHTokenHeight(pRidden)
		}
		else {
			return game.settings.get(cModuleName, "RidingHeight");
		}
	} 
	
	static MountingDistance() {
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
	
	static WithinMountingDistance(pRider, pRidden, pCustomDistance = null) {
		if (RideableCompUtils.isactiveModule(cTokenAttacher) && (RideableFlags.TokenForm(pRidden) == cTokenFormAttachedTiles)) {
			return Boolean(RideableCompUtils.TAAttachedTiles(pRidden).find(vTile => RideableUtils.WithinMountingDistance(pRider, vTile, pCustomDistance)));
		}
		
		let vCheckDistance = pCustomDistance;
		
		if (vCheckDistance == null) {
			if ((RideableCompUtils.isactiveModule(cArmReach) || RideableCompUtils.isactiveModule(cArmReachold)) && game.settings.get(cModuleName, "UseArmReachDistance")) {
				return RideableCompUtils.ARWithinMountingDistance(pRider, pRidden);
			}
			
			vCheckDistance = RideableUtils.MountingDistance();
		}
						
		if (game.settings.get(cModuleName, "BorderDistance")) {
			return GeometricUtils.TokenBorderDistance(pRidden, pRider) <= vCheckDistance;
		}
		else {
			return GeometricUtils.TokenDistance(pRidden, pRider) <= vCheckDistance;
		}
	}
	
	static UserofCharacterID(pID) {
		return game.users.filter(vuser => vuser.character).filter(vuser => vuser.character.id == pID);
	} 
	
	static isConnected(pToken, pObject) {
		if (RideableCompUtils.isactiveModule(cTokenAttacher)) {
			return RideableCompUtils.isTAAttachedto(pToken, pObject);
		}
		
		return false;
	}
	
	static canbeMoved(pObject) {
		if (RideableCompUtils.isactiveModule(cTokenAttacher)) {
			return !RideableCompUtils.isTAAttached(pObject);
		}
		
		return true;
	}
	
	static async totalWeight(pToken) {
		let vWeight = 0;
		
		let vActor = pToken?.actor;
		
		if (vActor) {
			for (let vItem of vActor.items) {
				let vItemWeight = vItem.system.weight?.value;
				
				if (vItemWeight == undefined) {
					vItemWeight = vItem.system.bulk?.value
				}

				if (vItemWeight) {
					if (vItemWeight == "L") {
						vItemWeight = 0.1;
					}
					
					if (!isNaN(vItemWeight)) {
						let vQuantity = await RideableUtils.getItemquantity(vItem);
						console.log(vQuantity);
						vWeight = vWeight + Number(vItemWeight) * vQuantity;
					}
				}
			}

			if (vActor.system?.details?.weight) {
				if (!isNaN(vActor.system.details.weight)) {
					vWeight = vWeight + Number(vActor.system.details.weight);
				}
				else {
					if (!isNaN(vActor.system.details.weight.value)) {
						vWeight = vWeight + Number(vActor.system.details.weight.value);
					}
				}
			}
		}
		
		return vWeight;
	}
	
	static async ItemQuantityPath(pItem, pItemtype = "", pSearchDepth = 10) {
		//pSearchDepth 10 is only an estimation
		let vPath = [];
		
		if (pItem && pSearchDepth > 0) {
			let vsubPath;
			let vPrimeKeys = Object.keys(pItem);
			
			if (pItemtype == vlastSearchedItemtype) {
				//if item path already known just return it
				return vlastItempath;
			}
			
			if (vPrimeKeys.length) {
				if (vPrimeKeys.includes(cQuantity)) {
					//if found return quantity path directly
					vPath.push(cQuantity);
					
					if (Object.keys(pItem[cQuantity])?.includes(cValue)) {
						vPath.push(cValue);
					};
				}
				else {
					//if not found search sub paths
					for (let i = 0; i < vPrimeKeys.length; i++) {
						if (vPath.length == 0) {
							//only (recursive)search if not already found
							vsubPath = RideableUtils.ItemQuantityPath(pItem[vPrimeKeys[i]], pSearchDepth-1);
							
							if (vsubPath.length > 0) {
								//subpath includes quantity, unshift path name into start of array and be done
								vPath = vsubPath;
								
								vPath.unshift(vPrimeKeys[i]);
							}				
						}
					}
				}
			}
			
			if (vPath.length > 0) {
				//to potentially increase the next searches speed
				vlastSearchedItemtype = pItemtype;
				vlastItempath = vPath;
			}
		}
		
		return vPath;
	}
	
	static async setItemquantity(pItem, pset, pCharacter = undefined) {		
		if (pItem) {
			if (pset <= 0 && pCharacter) {
				//special easy case
				pCharacter.actor.deleteEmbeddedDocuments("Item", [pItem.id]);
				
				return true;
			}
			 
			let vPath = (await RideableUtils.ItemQuantityPath(pItem.system, pItem.type)); 
			let vUpdate = {};
			
			vUpdate[vPath.join(".")] = pset;
			
			pItem.update({system : vUpdate});
			
			return true;
		}
		
		return false;
	}
	
	static async getItemquantity(pItem, pPath = []) {
		if (pItem) {
			let vBuffer = pItem.system;
			let vPath = pPath; 
			
			if (vPath.length <= 0) {
				vPath = await RideableUtils.ItemQuantityPath(pItem.system, [pItem.type]); 
			}
			
			if (vPath.length > 0) {
				for(let i = 0; i < vPath.length; i++) {	
					//last one will be quantity
					if (vBuffer) {
						vBuffer = vBuffer[vPath[i]]
					}
				}
				
				if (!isNaN(vBuffer)) {
					return Number(vBuffer);
				}
				else {
					return 0;
				}
			}	

			return 0;
		}
		else {
			return 0;
		}
	}
	
	static MovementEffectOverrides(pToken) {
		let vActor = pToken?.actor;
		
		let vModfiers = [];
		
		if (vActor) {
			let vAttributes = vActor.system.attributes;
			
			let vMovementKey = Object.keys(vAttributes).find(vKey => cMovementKeys.includes(vKey));
			
			if (vMovementKey) {
				for (vKey of Object.keys(vAttributes[vMovementKey])) {
					vModfiers.push(
						{
							key : "system.attributes." + vMovementKey + "." + vKey,
							mode : 5, //5, as in 5verride
							priority : null,
							value : vAttributes[vMovementKey][vKey]
						}
					);
				}
			}
		}
		
		return vModfiers;
	}
	
	//support
	static CompleteProperties(pProperties, pSource1, pSource2) {
		let vResult = {};
		
		for (let i = 0; i < pProperties.length; i++) {
			if (pSource1.hasOwnProperty(pProperties[i])) {
				vResult[pProperties[i]] = pSource1[pProperties[i]];
			}
			else {
				if (pSource2.hasOwnProperty(pProperties[i])) {
					vResult[pProperties[i]] = pSource2[pProperties[i]];
				}				
			}
		}
		
		return vResult;
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
	
	static async ApplicableEffects(pIdentifications) {
		let vEffects = [];
		
		for (let i = 0; i < pIdentifications.length; i++) {
			//world
			//id
			let vBuffer = await game.items.get(pIdentifications[i]);
			
			//-name
			if (!vBuffer) {
				vBuffer = await game.items.find(vEffect => vEffect.name == pIdentifications[i]);
			}
			
			//uu-id
			if (!vBuffer) {
				vBuffer = await fromUuid(pIdentifications[i]);
			}
			
			//compendium
			if (!vBuffer) {
				let vElement;
				let vPacks = game.packs.filter(vPacks => vPacks.documentName == "Item");//.map(vPack => vPack.index);
				
				//-id
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
					vBuffer = vElement;
					/*
					vBuffer = await game.items.filter(vToken => vToken.flags.core).find(vToken => vToken.flags.core.sourceId == "Compendium." + vPack.collection + ".Item." + vElement._id);
					
					if (!vBuffer) {
						vBuffer = await game.items.importFromCompendium(vPack, vElement._id);
					};
					*/
				}
			}
			
			if (vBuffer && [cPf2ConditionType, cPf2EffectType].includes(vBuffer.type)) {
				if (typeof vBuffer == "object") {
					vEffects[vEffects.length] = foundry.utils.duplicate(vBuffer);
				}
				else {
					vEffects[vEffects.length] = vBuffer.toObject();
				}
			}
		}
		
		return vEffects;
	}
	
	static CustomWorldRidingEffects() {
		return game.settings.get(cModuleName, "CustomRidingEffects").split(cDelimiter);
	}
	
	static CustomWorldGrapplingEffects() {
		return game.settings.get(cModuleName, "CustomGrapplingEffects").split(cDelimiter);
	}
}

//for easy translation
function Translate(pName, pWithModuleTag = true){
	if (pWithModuleTag) {
		return game.i18n.localize(cModuleName+"."+pName);
	}
	else {
		return game.i18n.localize(pName);
	}
}

function TranslateandReplace(pName, pWords = {}){
	let vContent = Translate(pName);
	
	for (let vWord of Object.keys(pWords)) {
		vContent = vContent.replace("{" + vWord + "}", pWords[vWord]);
	}
 
	return vContent;
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
export{ RideableUtils, Translate, TranslateandReplace, switchScene };
