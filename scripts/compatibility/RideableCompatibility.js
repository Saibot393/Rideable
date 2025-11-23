import { RideableUtils, cModuleName, Translate, TranslateandReplace } from "../utils/RideableUtils.js";
import { RideableFlags } from "../helpers/RideableFlags.js";
import { isRider } from "../helpers/RideableFlags.js";
import { UpdateRidderTokens } from "../RidingScript.js";
import { RideablePopups } from "../helpers/RideablePopups.js";
import { Mount, UnMount, UnMountallRiders, MountbyID, UnMountbyID, UnMountallRidersbyID } from "../MountingScript.js";

import { RideableCompUtils, cLockTypeRideable, cRideableTag } from "./RideableCompUtils.js";
import { cDnD5e, cStairways, cTagger, cWallHeight, cLocknKey, cMATT } from "./RideableCompUtils.js";
//			SW			TGG		WH

//RideableCompatibility will take care of compatibility with other modules in regards to calls, currently supported:

class RideableCompatibility {
	//DECLARATIONS
	
	//specific: MATT
	static async onTileTrigger(pTile, pTrigger, pInfos, pUserID, pData) {} //called when a tile is triggered
	
	static async onpreTileTrigger(pTile, pTrigger, pInfos, pUserID, pData) {} //called bevore a tile is triggered
	
	//specific: stairways
	static onSWTeleport(pData) {} //called if stairways module is active and teleport is triggered

	//static onSWPreTeleport(pData) {} //called if stairways module is active and pre teleport is triggered
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pTarget, pUserID) {} //called if Rideable Teleports Tokens
	
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld = true, pTeleportMount = true, pupdatePrevID = true) {} //Organises the teleport of all Riders of pTokenID
	
	static async TeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld = true, pTeleportMount = true, pupdatePrevID = true) {} //teleports all Tokens in pTokenIDs that have not yet been teleported
	
	//specific: wall-heights
	static onWHTokenupdate(pToken, pchanges, pInfos) {} //only called if cWallHeight is active and a token updates, handels HWTokenheight updates for riders
	
	//specific: tagger
	static onTGGTokenpreupdate(pToken, pchanges, pInfos) {} //only called if cTagger is active and a token updates, handels tagger updates for ridden 
	//IMPLEMENTATIONS
	
	//specific: MATT
	static async onTileTrigger(pTile, pTrigger, pInfos, pUserID, pData) {
		if (pInfos.action == "teleport" && pInfos.data.location.sceneId) {
			/*
			if (game.user.isGM) {
				RideableCompatibility.RequestRideableTeleport(pData.selectedTokenIds, pData.sourceSceneId, pData.targetSceneId, pData.targetData, game.user.id);
			}
			else {
				game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : pData.selectedTokenIds, pSourceSceneID : pData.sourceSceneId, pTargetSceneID : pData.targetSceneId, pTarget : {x : pData.targetData.x, y : pData.targetData.y}, pUserID : pData.userId}});
			}
			*/
		}
	}
	
	static async onpreTileTrigger(pTile, pTrigger, pInfos, pUserID, pData) {
		if (pInfos.action == "teleport" && pInfos.data.location.sceneId) {
			let vRiders = pData.tokens.filter(vToken => RideableFlags.isRider(vToken));
			//pData.tokens = pData.tokens.filter(vToken => !vRiders.includes(vToken));
			
			//this is going to be messy, need to filter array without reasignment
			let vValidCopy = pTrigger.filter(vToken => !vRiders.includes(vToken));
			for (let i = 0; i < vValidCopy.length; i++) {
				pTrigger[i] = vValidCopy[i];
			}
			
			while(pTrigger.length > vValidCopy.length) {
				pTrigger.pop();
			}
			
			//preport riders
			/*
			let vRidersofPorters =[];
			
			for (let vPorter of pData.tokens) {
				vRidersofPorters.push(...RideableFlags.RiderTokens(vPorter));
			}
			
			if (vRidersofPorters.length) {
				await RideableCompatibility.SWTeleportleftTokens(vRidersofPorters.map(vToken => vToken.id), pTile.parent, game.scenes.get(pInfos.data.location.sceneId), {x: pInfos.data.location.x, y: pInfos.data.location.y}, game.users.get(pUserID), pInfos.data.deletesource, false, false);
			else {
				game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : pData.selectedTokenIds, pSourceSceneID : pData.sourceSceneId, pTargetSceneID : pData.targetSceneId, pTarget : {x : pData.targetData.x, y : pData.targetData.y}, pUserID : pData.userId}});
			}
			*/
		}
	} 
	
	//specific: stairways
	static onSWTeleport(pData) {
		if (game.user.isGM) {
			RideableCompatibility.RequestRideableTeleport(pData.selectedTokenIds, pData.sourceSceneId, pData.targetSceneId, pData.targetData, game.user.id);
		}
		else {
			game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : pData.selectedTokenIds, pSourceSceneID : pData.sourceSceneId, pTargetSceneID : pData.targetSceneId, pTarget : {x : pData.targetData.x, y : pData.targetData.y}, pUserID : pData.userId}});
		}
	}
	
/*	static onSWPreTeleport(pData) {
		if (!game.user.isGM) {
			if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow") {
				//stop riders from moving through stairways
				let vInvalidTokens = [];
				
				for (let i = 0; i < pData.selectedTokenIds.length; i++) {
					
					if (RideableFlags.isRider(RideableUtils.TokenfromID(pData.selectedTokenIds[i]))) {
						vInvalidTokenspush(pData.selectedTokenIds[i]);
						
						let vToken = RideableUtils.TokenfromID(pData.selectedTokenIds[i]);
						RideablePopups.TextPopUpID(vToken ,"PreventedRiderMove", {pRiddenName : RideableFlags.RiddenToken(pToken).name}); //MESSAGE POPUP
					}
				}
				
				pData.selectedTokenIds = pData.selectedTokenIds.filter(vID => !vInvalidTokens.includes(vID));
				
				if (!pData.selectedTokenIds.length) {
					//stop scene change if all tokens are invalid
					pData.userId = "";
				}
				
				return (pData.selectedTokenIds);
			}
		}
		
		return pData.selectedTokenIds;
	}*/
	
	static RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pTarget, pUserID) {
		if (game.user.isGM) {
			if ((pSourceSceneID != pTargetSceneID) && pSourceSceneID && pTargetSceneID) {
				//only necessary for cross scene teleport
				
				let vSourceScene = game.scenes.get(pSourceSceneID);
				let vTargetScene = game.scenes.get(pTargetSceneID);
				
				RideableCompatibility.OrganiseTeleport(pTokenIDs, vSourceScene, vTargetScene, pTarget, game.users.get(pUserID));
			}
		}
	} 	
		
	static async OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld = true, pTeleportMount = true, pupdatePrevID = true) {
		if (game.user.isGM) {
			if (pSourceScene != pTargetScene) {
				if (pSourceScene && pTargetScene) {
					for (let i = 0; i < pTokenIDs.length; i++) {
						let vToken = RideableCompUtils.TokenwithpreviousID(pTokenIDs[i], pTargetScene);
						
						if (vToken) {
							if (pTeleportMount && RideableFlags.isRider(vToken)) {
								//test if ridden token was left behind
								let vRiddenToken = pSourceScene.tokens.find(vpreviousToken => RideableFlags.isRiddenbyID(vpreviousToken, RideableCompUtils.PreviousID(vToken)));
								
								if (vRiddenToken && (vRiddenToken.actor.ownership[pUser.id] >= 3 || vRiddenToken.actor.ownership.default >= 3)) {
									//only teleport if ridden token is owned
									await RideableCompatibility.TeleportleftTokens([vRiddenToken.id], pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld, pTeleportMount, pupdatePrevID);
								}
							}
							
							if (RideableFlags.isRidden(vToken) || RideableFlags.isFollowedID(pTokenIDs[i], pSourceScene)) {
								//teleport riders
								await RideableCompatibility.TeleportleftTokens(RideableFlags.RiderTokenIDs(vToken), pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld, pTeleportMount, pupdatePrevID);
								
								//update ridden by id flags
								await RideableCompUtils.UpdateRiderIDs(vToken);
								
								//order riders
								let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(vToken), vToken.scene);
						
								UpdateRidderTokens(vToken, vRiderTokenList, false, false);
								
								//teleport followers
								let vOldFollowers = RideableFlags.IDfollowingTokens(pTokenIDs[i], pSourceScene).map(vToken => vToken.id);
								let vNewFollowers = await RideableCompatibility.TeleportleftTokens(vOldFollowers, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld, pTeleportMount, pupdatePrevID);
								
								let vRelevantPlayers = [];
								vNewFollowers.forEach(vFollower => {
									RideableFlags.updateFollowedID(vFollower, vToken.id);
									vRelevantPlayers.push(vFollower.flags[cModuleName].FollowOrderPlayerIDFlag);
								});
								
								if (vRelevantPlayers.includes(game.user.id)) {
									Hooks.call(cModuleName + "replaceFollowerListIDs", [pTokenIDs[i]], [vToken.id]); //TEST!
								};
								game.socket.emit("module.Rideable", {pFunction : "RequestreplaceFollowerListIDs", pData : {pPlayers : vRelevantPlayers, pOldIDs : [pTokenIDs[i]], pNewIDs : [vToken.id]}});
								
								//update
								
								if (pupdatePrevID) RideableCompUtils.UpdatePreviousID(vToken);
							}
						}
					}
				}
			}
		}
	}
	
	static async TeleportleftTokens(pTokenIDs, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld = true, pTeleportMount = true, pupdatePrevID = true) {
		let vCreatedTokens = [];
		//adapted from staiways(by SWW13)>teleport.js>handleTeleportRequestGM:
		if (pSourceScene && pTargetScene) {
			//filter pTokenIDs
			let vValidTokenIDs = await pTokenIDs.filter(vID => pSourceScene.tokens.get(vID));
			
			// get selected tokens data
			if (vValidTokenIDs.length) {
				let vselectedTokensData = foundry.utils.duplicate(pSourceScene.tokens.filter((vToken) => vValidTokenIDs.includes(vToken.id)))

				// set new token positions
				for (let vToken of vselectedTokensData) {
					vToken.x = Math.round(pTarget.x - vToken.width * pTargetScene.grid.size / 2);
					vToken.y = Math.round(pTarget.y - vToken.height * pTargetScene.grid.size / 2);
				}					

				// remove selected tokens from current scene (keep remaining tokens)
				if (pDeleteOld) await pSourceScene.deleteEmbeddedDocuments(Token.embeddedName, vValidTokenIDs, { isUndo: true, RideableSpawn: true});
				// add selected tokens to target scene
				vCreatedTokens = await pTargetScene.createEmbeddedDocuments(Token.embeddedName, vselectedTokensData, { isUndo: true, RideableSpawn: true});
				
				
				for (let i = 0; i < vselectedTokensData.length; i++) {
					//if a standard token gets teleported, let respective owener see the new scene		
					let vUsers = RideableUtils.UserofCharacterID(vselectedTokensData[i].actorId);
					
					for (let j = 0; j < vUsers.length; j++) {
						game.socket.emit("module.Rideable", {pFunction : "switchScene", pData : {pUserID : vUsers[j].id, pSceneID : pTargetScene.id, px : pTarget.x, py : pTarget.y}});
					}
				}		
				
				game.socket.emit("module.Rideable", {pFunction : "RequestRideableTeleport", pData : {pTokenIDs : vValidTokenIDs, pSourceSceneID : pSourceScene.id, pTargetSceneID : pTargetScene.id, pTarget : {x : pTarget.x, y : pTarget.y}, pUserID : pUser.id}});
			}
		}
		
		await RideableCompatibility.OrganiseTeleport(pTokenIDs, pSourceScene, pTargetScene, pTarget, pUser, pDeleteOld, pTeleportMount, pupdatePrevID);
		
		return vCreatedTokens;
	} 
	
	//specific: wall-heights	
	static onWHTokenupdate(pToken, pchanges, pInfos) {
		if (game.user.isGM) {			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(pToken)) {
				
				//check if token position was actually changed
				if (pchanges.flags && pchanges.flags[cWallHeight]) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), pToken.scene);
					
					UpdateRidderTokens(pToken, vRiderTokenList, false, pInfos.animate);
				}
			}
		}
	}
	
	//specific: tagger
	static onTGGTokenpreupdate(pToken, pchanges, pInfos) {	
		if (game.settings.get(cModuleName, "TaggerMountingIntegration")) {
			if (game.user.isGM && RideableFlags.TokenisRideable(pToken)) {			
				if (pchanges.flags && pchanges.flags.hasOwnProperty(cTagger)) {
					//get orriginal token for comparrison
					let vOriginalToken = RideableUtils.TokenfromID(pToken.id);
					
					let vCurrentTags = pchanges.flags[cTagger].tags;
					let vOriginalTags = [];
					
					let vAddedIDs = [];
					let vRemovedIDs = [];
					
					if (vOriginalToken.flags && vOriginalToken.flags.hasOwnProperty(cTagger)) {
						vOriginalTags = vOriginalToken.flags[cTagger].tags;
					}
					
					if (vCurrentTags && vOriginalTags) {
						//figure out which tokens have been added and which have been deleted
						vAddedIDs = vCurrentTags.filter(vTag => !vOriginalTags.includes(vTag)).filter(vTag => vTag.startsWith(cRideableTag)).map(vTag => vTag.substr(cRideableTag.length));
						
						vRemovedIDs = vOriginalTags.filter(vTag => !vCurrentTags.includes(vTag)).filter(vTag => vTag.startsWith(cRideableTag)).map(vTag => vTag.substr(cRideableTag.length));		

						//mount new ones and unmount old ones
						MountbyID(vAddedIDs, vOriginalToken.id);
						
						UnMountbyID(vRemovedIDs);
					}
				}
			}
		}
	} 
}


//exports
function RequestRideableTeleport({ pTokenIDs, pSourceSceneID, pTargetSceneID, pTarget, pUserID} = {}) { return RideableCompatibility.RequestRideableTeleport(pTokenIDs, pSourceSceneID, pTargetSceneID, pTarget, pUserID); }

export { RequestRideableTeleport };

//Hook into other modules
Hooks.once("init", async () => {
	
	if (game.system.id == cDnD5e) {
		Hooks.on("dnd5e.determineOccupiedGridSpaceBlocking", (vGridSpace, vToken, vOptions, vFound) => {
			vFound.forEach(vtoTest => {
				if (RideableFlags.RidingConnection(vToken.document, vtoTest.document)) vFound.delete(vtoTest);
			});
		});
		
		Hooks.on("dnd5e.determineOccupiedGridSpaceDifficult", (vGridSpace, vToken, vOptions, vFound) => {
			vFound.forEach(vtoTest => {
				if (RideableFlags.RidingConnection(vToken.document, vtoTest.document)) vFound.delete(vtoTest);
			});
		});
		
		let vClass = Canvas.layers.tokens.layerClass.prototype;
		
		//the following code is modified based on https://github.com/foundryvtt/dnd5e/blob/5.1.x/module/canvas/layers/tokens.mjs
		let vRideablegetRelevantOccupyingTokens = (gridSpace, token, { preview=false }={}) => {
			const grid = canvas.grid;
			if ( grid.isGridless ) return [];
			const topLeft = grid.getTopLeftPoint(gridSpace);
			const rect = new PIXI.Rectangle(topLeft.x, topLeft.y, grid.sizeX, grid.sizeY);
			const lowerElevation = gridSpace.k * grid.distance;
			const upperElevation = (gridSpace.k + 1) * grid.distance;
			return game.canvas.tokens.quadtree.getObjects(rect, {
				collisionTest: ({ t }) => {
					// Ignore self
					if ( t === token ) return false;

					 // Ignore tokens when moving together
					if ( canvas.tokens.controlled.includes(t) ) return false;

					// Always ignore hidden tokens
					if ( t.document.hidden ) return false;

					// If preview movement, don't reveal blocked or difficult terrain for non-visible tokens
					if ( preview && !t.visible ) return false;

					// Always ignore secret tokens
					if ( t.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET ) return false;

					// Ignore different elevation
					const occupiedElevation = t.document._source.elevation;
					if ( (occupiedElevation < lowerElevation) || (occupiedElevation >= upperElevation) ) return false;

					// Ensure space is actually occupied, not merely touching border of rectangle
					const gridSpaces = t.document.getOccupiedGridSpaceOffsets(t.document._source);
					return gridSpaces.some(coord => (coord.i === gridSpace.i) && (coord.j === gridSpace.j));
				}
			}).filter(vToken => !RideableFlags.RidingConnection(vToken.document, token.document) || CONFIG.RideableDnDWorkaroundDisable);
		}
		
		vClass.isOccupiedGridSpaceBlocking = (gridSpace, token, { preview=false }={}) => {
			const found = vRideablegetRelevantOccupyingTokens(gridSpace, token, { preview });
			const tokenSize = CONFIG.DND5E.actorSizes[token.actor?.system.traits?.size]?.numerical ?? 2;
			const modernRules = game.settings.get("dnd5e", "rulesVersion") === "modern";
			const halflingNimbleness = token.actor?.getFlag("dnd5e", "halflingNimbleness");
			return found.some(t => {
				// Only creatures block movement.
				if ( !t.actor?.system.isCreature ) return false;

				// Friendly tokens never block movement
				if ( token.document.disposition === t.document.disposition ) return false;

				// If creature has any statuses that should never block movement, don't block movement
				if ( t.actor.statuses.intersects(CONFIG.DND5E.neverBlockStatuses) ) return false;

				const occupiedSize = CONFIG.DND5E.actorSizes[t.actor.system.traits.size]?.numerical ?? 2;
				// In modern rules, Tiny creatures can be moved through
				if ( modernRules && (occupiedSize === 0) ) return false;

				// Halfling Nimbleness means no larger creature can block
				if ( halflingNimbleness && (occupiedSize > tokenSize) ) return false;

				// A size difference of less than 2 should block
				return Math.abs(tokenSize - occupiedSize) < 2;
		});
		
		vClass.isOccupiedGridSpaceDifficult = (gridSpace, token, { preview=false }={}) => {
			const found = vRideablegetRelevantOccupyingTokens(gridSpace, token, { preview });
			const modernRules = game.settings.get("dnd5e", "rulesVersion") === "modern";
			return found.some(t => {
				// Only consider creatures as difficult terrain for now.
				if ( !t.actor?.system.isCreature ) return false;

				const friendlyToken = token.document.disposition === t.document.disposition;

				// In modern rules, friendly tokens are not difficult terrain
				if ( modernRules && friendlyToken ) return false;
				const occupiedSize = CONFIG.DND5E.actorSizes[t.actor?.system.traits.size]?.numerical ?? 2;

				// In modern rules, Tiny creatures are not difficult terrain
				if ( modernRules && (occupiedSize === 0) ) return false;

				// Any token which has not been filtered out by this point should at least be difficult terrain, if not blocking
				return true;
			});
		}
  }
	}
	
	if (RideableCompUtils.isactiveModule(cStairways)) {
		Hooks.on("StairwayTeleport", (...args) => RideableCompatibility.onSWTeleport(...args));
		
		//Hooks.on("PreStairwayTeleport", (...args) => RideableCompatibility.onSWPreTeleport(...args));
	}
	
	if (RideableCompUtils.isactiveModule(cMATT)) {
		//Hooks.on("triggerTile", (pTile, palsoTile, pTrigger, pInfos, pUserID, pData) => RideableCompatibility.onTileTrigger(pTile, pTrigger, pInfos, pUserID, pData));
		
		//Hooks.on("preTriggerTile", (pTile, palsoTile, pTrigger, pInfos, pUserID, pData) => RideableCompatibility.onpreTileTrigger(pTile, pTrigger, pInfos, pUserID, pData));
	}
	
	if (RideableCompUtils.isactiveModule(cStairways) || RideableCompUtils.isactiveModule(cMATT)) {
		Hooks.on(cModuleName + "." + "Mount", (pRider, pRidden) => {
																	RideableCompUtils.UpdatePreviousID(pRider)
																	RideableCompUtils.UpdatePreviousID(pRidden)
																	}); //so after Teleport Token can still be found through the old id
																	
		Hooks.on(cModuleName + ".StartFollowing", (pToken, pFollowed) => {
																	RideableCompUtils.UpdatePreviousID(pToken)
																	RideableCompUtils.UpdatePreviousID(pFollowed)
																		}); //so after Teleport Token can still be found through the old id
																	
		Hooks.on(cModuleName + "." + "Teleport", (...args) => RideableCompatibility.RequestRideableTeleport(...args));
	}
	
	if (RideableCompUtils.isactiveModule(cWallHeight)) {
		Hooks.on("updateToken", (...args) => RideableCompatibility.onWHTokenupdate(...args));
	}
	
	if (RideableCompUtils.isactiveModule(cLocknKey)) {
		Hooks.on(cLocknKey+".Locktype", (pDocument, pLocktype) => {if ((pDocument.documentName == "Token") && RideableFlags.TokenissetRideable(pDocument) && game.settings.get(cModuleName, "LocknKeyintegration")) {pLocktype.type = cLockTypeRideable }}); //return Rideable Lock type if valid rideable
		
		Hooks.on(cLocknKey+".isTokenLocktype", (pLocktype, vLockInfo) => {if ((pLocktype == cLockTypeRideable) && game.settings.get(cModuleName, "LocknKeyintegration")) { vLockInfo.isTokenLocktype = true }}); //return true if pLocktype matches cLockTypeRideable
	}
	
	if (RideableCompUtils.isactiveModule(cTagger)) {
		Hooks.on("preUpdateToken", (...args) => RideableCompatibility.onTGGTokenpreupdate(...args));
		
		Hooks.on("preUpdateTile", (...args) => RideableCompatibility.onTGGTokenpreupdate(...args));
	}
	
	//compatibility exports
	game.modules.get(cModuleName).api = {
		isRider
	};
});

Hooks.once("setupTileActions", (pMATT) => {
	if (RideableCompUtils.isactiveModule(cMATT)) {
		//let vMATTmodule = await import("../../../monks-active-tiles/monks-active-tiles.js"); //Help, this is ugly, i don't want to do this, why, oh why?
		
		//let vMATT = vMATTmodule?.MonksActiveTiles;
		
		if (pMATT) {
			pMATT.registerTileGroup(cModuleName, Translate("Titles." + cModuleName));
			
			//mount this tile action
			pMATT.registerTileAction(cModuleName, 'mount-this-tile', {
				name: Translate(cMATT + ".actions." + "mount-this-tile" + ".name"),
				requiresGM: true,
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return (entity instanceof Token); }
					}
				],
				group: cModuleName,
				fn: async (args = {}) => {
					let vtoMountTokens = await pMATT.getEntities(args);
					
					let vTile = args.tile;
					
					if (vTile && vtoMountTokens.length > 0) {
						game.Rideable.Mount(vtoMountTokens, vTile);
					}
				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					
					return TranslateandReplace(cMATT + ".actions." + "mount-this-tile" + ".descrp", {pname : Translate(trigger.name, false), pEntities : entityName})
					//return `<span class="logic-style">${Translate(trigger.name, false)}</span> <span class="entity-style">${entityName}</span>`;
				}
			});
			
			//mount target
			pMATT.registerTileAction(cModuleName, 'mount-target', {
				name: Translate(cMATT + ".actions." + "mount-target" + ".name"),
				requiresGM: true,
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return (entity instanceof Token); }
					},
					{
						id: "target",
						name: Translate(cMATT + ".actions." + "mount-target" + ".settings." + "target" + ".name"),
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'tile', 'within', 'players', 'previous', 'tagger'] },
						required: true,
						restrict: (entity) => { return ((entity instanceof Token) || (entity instanceof Tile)); }
					}
				],
				group: cModuleName,
				fn: async (args = {}) => {
					const { action } = args;
					
					let vtoMountTokens = await pMATT.getEntities(args);
					
					let vMount = (await pMATT.getEntities(args, "tokens", action.data?.target));
					
					if (vMount.length) {
						vMount = vMount[0];
					}
					
					if (vMount && vtoMountTokens.length > 0) {
						game.Rideable.Mount(vtoMountTokens, vMount);
					}
				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					let vMountName = await pMATT.entityName(action.data?.target || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					
					return TranslateandReplace(cMATT + ".actions." + "mount-target" + ".descrp", {pname : Translate(trigger.name, false), pEntities : entityName, pMount : vMountName})
					//return `<span class="logic-style">${Translate(trigger.name, false)}</span> <span class="entity-style">${entityName}</span>`;
				}
			});
			
			//unmount all tokens
			pMATT.registerTileAction(cModuleName, 'unmount', {
				name: Translate(cMATT + ".actions." + "unmount" + ".name"),
				requiresGM: true,
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return (entity instanceof Token); }
					}
				],
				group: cModuleName,
				fn: async (args = {}) => {
					const { action } = args;
					
					let vtoUnMountTokens = await pMATT.getEntities(args);
					
					if (vtoUnMountTokens.length > 0) {
						game.Rideable.UnMount(vtoUnMountTokens);
					}
				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					return TranslateandReplace(cMATT + ".actions." + "unmount" + ".descrp", {pname : Translate(trigger.name, false), pEntities : entityName})
					//return `<span class="logic-style">${Translate(trigger.name, false)}</span> <span class="entity-style">${entityName}</span>`;
				}
			});
			
			//unmount all riders
			pMATT.registerTileAction(cModuleName, 'unmount-riders', {
				name: Translate(cMATT + ".actions." + "unmount-riders" + ".name"),
				requiresGM: true,
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'tile', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return ((entity instanceof Token) || (entity instanceof Tile)); }
					}
				],
				group: cModuleName,
				fn: async (args = {}) => {
					const { action } = args;
					
					let vRiddenTokens = await pMATT.getEntities(args);
					
					for (let i = 0; i < vRiddenTokens.length; i++) {
						game.Rideable.UnMountallRiders(vRiddenTokens[i]);
					}
				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					return TranslateandReplace(cMATT + ".actions." + "unmount-riders" + ".descrp", {pname : Translate(trigger.name, false), pEntities : entityName})
				}
			});
			
			//toggle mount target
			pMATT.registerTileAction(cModuleName, 'toggle-mount-target', {
				name: Translate(cMATT + ".actions." + "toggle-mount-target" + ".name"),
				requiresGM: true,
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return (entity instanceof Token); }
					},
					{
						id: "target",
						name: Translate(cMATT + ".actions." + "mount-target" + ".settings." + "target" + ".name"),
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'tile', 'within', 'players', 'previous', 'tagger'] },
						required: true,
						restrict: (entity) => { return ((entity instanceof Token) || (entity instanceof Tile)); }
					}
				],
				group: cModuleName,
				fn: async (args = {}) => {
					const { action } = args;
					
					let vtoChangeTokens = await pMATT.getEntities(args);
					
					let vMount = (await pMATT.getEntities(args, "tokens", action.data?.target));
					
					if (vMount.length) {
						vMount = vMount[0];
					}
					
					if (vMount && vtoChangeTokens.length > 0) {
						game.Rideable.ToggleMount(vtoChangeTokens, vMount);
					}
				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					let vMountName  = await pMATT.entityName(action.data?.target);
					
					return TranslateandReplace(cMATT + ".actions." + "toggle-mount-target" + ".descrp", {pname : Translate(trigger.name, false), pEntities : entityName, pMount : vMountName})
				}
			});
			
			//filter riders of
			pMATT.registerTileAction(cModuleName, 'riders-of', {
				name: Translate(cMATT + ".filters." + "riders-of" + ".name"),
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return (entity instanceof Token); }
					},
					{
						id: "mount",
						name: Translate(cMATT + ".filters." + "riders-of" + ".settings." + "mount" + ".name"),
						type: "select",
						subtype: "entity",
						options: { show: ['tile', 'token', 'within', 'players', 'previous', 'tagger'] },
						required: true,
						restrict: (entity) => { return ((entity instanceof Token) || (entity instanceof Tile)) }
					},
					{
						id: "filterCondition",
						name: Translate(cMATT + ".filters." + "riders-of" + ".settings." + "filterCondition" + ".name"),
						list: "filterCondition",
						type: "list",
						defvalue: 'rider'
					},
					{
						id: "continue",
						name: "Continue if",
						list: "continue",
						type: "list",
						defvalue: 'always'
					}
				],
				values: {
					"filterCondition": {
						"rider": Translate(cMATT + ".filters." + "riders-of" + ".settings." + "filterCondition" + ".options." + "rider"),
						"notrider": Translate(cMATT + ".filters." + "riders-of" + ".settings." + "filterCondition" + ".options." + "notrider"),
					},
					'continue': {
						"always": "Always",
						"any": "Any Matches",
						"all": "All Matches",
					}
				},
				fn: async (args = {}) => {

					const { action } = args;

					const entities = await pMATT.getEntities(args);
					
					let vMount = await pMATT.getEntities(args, "tokens", action.data?.mount);
					
					if (vMount.length) {
						vMount = vMount[0];
					}
					
					let vEntityCount = entities.length;
					
					let vFiltered;
					
					if (vMount) {
						switch(action.data?.filterCondition) {
							case "rider":
								vFiltered = entities.filter(vObject => game.modules.get("Rideable").api.RideableFlags.isRiddenby(vMount, vObject));
								break;
							case "notrider":
								vFiltered = entities.filter(vObject => !game.modules.get("Rideable").api.RideableFlags.isRiddenby(vMount, vObject));
								break;
						}
					}
					else {
						vFiltered = [];
					}

					const vContinue = (action.data?.continue === 'always'
						|| (action.data?.continue === 'any' && vFiltered.length > 0)
						|| (action.data?.continue === 'all' && vFiltered.length == vEntityCount && vFiltered.length > 0));

					return { continue: vContinue, tokens: vFiltered };

				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					let vMountName  = await pMATT.entityName(action.data?.target);
					
					let vCondition = Translate(cMATT + ".filters." + "riders-of" + ".settings." + "filterCondition" + ".options." + action.data.filterCondition);
					
					return TranslateandReplace(cMATT + ".filters." + "riders-of" + ".descrp", {pname : Translate(cMATT + ".filters.name"), pEntities : entityName, pMount : vMountName, pCondition : vCondition});
				}
			});
			
			//filter is rider
			pMATT.registerTileAction(cModuleName, 'is-rider', {
				name: Translate(cMATT + ".filters." + "is-rider" + ".name"),
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => {return (entity instanceof Token); }
					},
					{
						id: "filterCondition",
						name: Translate(cMATT + ".filters." + "is-rider" + ".settings." + "filterCondition" + ".name"),
						list: "filterCondition",
						type: "list",
						defvalue: 'rider'
					},
					{
						id: "continue",
						name: "Continue if",
						list: "continue",
						type: "list",
						defvalue: 'always'
					}
				],
				values: {
					"filterCondition": {
						"rider": Translate(cMATT + ".filters." + "is-rider" + ".settings." + "filterCondition" + ".options." + "rider"),
						"notrider": Translate(cMATT + ".filters." + "is-rider" + ".settings." + "filterCondition" + ".options." + "notrider"),
					},
					'continue': {
						"always": "Always",
						"any": "Any Matches",
						"all": "All Matches",
					}
				},
				fn: async (args = {}) => {

					const { action } = args;

					const entities = await pMATT.getEntities(args);
					
					let vEntityCount = entities.length;
					
					let vFiltered;
		
					switch(action.data?.filterCondition) {
						case "rider":
							vFiltered = entities.filter(vObject => game.modules.get("Rideable").api.RideableFlags.isRider(vObject));
							break;
						case "notrider":
							vFiltered = entities.filter(vObject => !game.modules.get("Rideable").api.RideableFlags.isRider(vObject));
							break;
					}

					const vContinue = (action.data?.continue === 'always'
						|| (action.data?.continue === 'any' && vFiltered.length > 0)
						|| (action.data?.continue === 'all' && vFiltered.length == vEntityCount && vFiltered.length > 0));

					return { continue: vContinue, tokens: vFiltered };

				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					
					let vCondition = Translate(cMATT + ".filters." + "is-rider" + ".settings." + "filterCondition" + ".options." + action.data.filterCondition);
					
					return TranslateandReplace(cMATT + ".filters." + "is-rider" + ".descrp", {pname : Translate(cMATT + ".filters.name"), pEntities : entityName, pCondition : vCondition});
				}
			});
			
			//filter is ridden
			pMATT.registerTileAction(cModuleName, 'is-ridden', {
				name: Translate(cMATT + ".filters." + "is-ridden" + ".name"),
				ctrls: [
					{
						id: "entity",
						name: "MonksActiveTiles.ctrl.select-entity",
						type: "select",
						subtype: "entity",
						options: { show: ['tile', 'token', 'within', 'players', 'previous', 'tagger'] },
						defvalue : "previous",
						restrict: (entity) => { return ((entity instanceof Token) || (entity instanceof Tile)); }
					},
					{
						id: "filterCondition",
						name: Translate(cMATT + ".filters." + "is-ridden" + ".settings." + "filterCondition" + ".name"),
						list: "filterCondition",
						type: "list",
						defvalue: 'ridden'
					},
					{
						id: "continue",
						name: "Continue if",
						list: "continue",
						type: "list",
						defvalue: 'always'
					}
				],
				values: {
					"filterCondition": {
						"ridden": Translate(cMATT + ".filters." + "is-ridden" + ".settings." + "filterCondition" + ".options." + "ridden"),
						"notridden": Translate(cMATT + ".filters." + "is-ridden" + ".settings." + "filterCondition" + ".options." + "notridden"),
					},
					'continue': {
						"always": "Always",
						"any": "Any Matches",
						"all": "All Matches",
					}
				},
				fn: async (args = {}) => {

					const { action } = args;

					const entities = await pMATT.getEntities(args);
					
					let vEntityCount = entities.length;
					
					let vFiltered;
		
					switch(action.data?.filterCondition) {
						case "ridden":
							vFiltered = entities.filter(vObject => game.modules.get("Rideable").api.RideableFlags.isRidden(vObject));
							break;
						case "notridden":
							vFiltered = entities.filter(vObject => !game.modules.get("Rideable").api.RideableFlags.isRidden(vObject));
							break;
					}

					const vContinue = (action.data?.continue === 'always'
						|| (action.data?.continue === 'any' && vFiltered.length > 0)
						|| (action.data?.continue === 'all' && vFiltered.length == vEntityCount && vFiltered.length > 0));

					return { continue: vContinue, tokens: vFiltered };

				},
				content: async (trigger, action) => {
					let entityName = await pMATT.entityName(action.data?.entity || trigger.ctrls.find(c => c.id == "entity")?.defvalue);
					
					let vCondition = Translate(cMATT + ".filters." + "is-ridden" + ".settings." + "filterCondition" + ".options." + action.data.filterCondition);
					
					return TranslateandReplace(cMATT + ".filters." + "is-ridden" + ".descrp", {pname : Translate(cMATT + ".filters.name"), pEntities : entityName, pCondition : vCondition});
				}
			});
		}
	}
});