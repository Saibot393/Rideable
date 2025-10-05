import { RideableFlags } from "./helpers/RideableFlags.js";
import { GeometricUtils } from "./utils/GeometricUtils.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideableCompUtils, cRoutingLib } from "./compatibility/RideableCompUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";

let vFollowedList;

class FollowingManager {
	//DECLARATIONS
	static FollowingActive() {} //returns if the token following feature is active
	
	static async FollowToken(pFollowers, pTarget, pDistance = -1) {} //sets pFollowers to follow pTarget
	
	static async StopFollowing(pFollowers) {} //stops pFollowers from following
	
	static async SelectedFollowHovered(pConsiderTargeted = true, pDistance = -1) {} //lets the selected tokens follow the hovered token
	
	static async SelectedStopFollowing(pPopup = true) {} //makes the selected tokens stop following
	
	static async SelectedToggleFollwing(pConsiderTargeted = true, pDistance = -1) {} //toggles the selected tokens regarding following
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Distance : undefined, Target : undefined, Scene : undefined, RidingMovement : false}) {} //calculates the new following route of pFollowers
	
	static async gotonextPointonRoute(pToken) {} //updates pTokens to new point on Route
	
	static async PlanDestack(pToken) {} //plans a new position for pToken that does not collide with other followers of same target
	
	static updateFollowedList() {} //updates the followed list
	
	static replaceFollowerListIDs(pOldIDs, pNewIDs) {} //replaces pOldID on vFollowedList with pNewID
	
	static async updatePathHistory(pToken, pchanges) {} //updates the path history for pToken
	
	//support
	static async SimplePathHistoryRoute(pFollower, pTarget, pDistance, pInfos = {}) {} //returns the route for pFollower to follow pTarget at pDistance
	
	static async FollowedTokenList() {} //returns a list of ids of followed tokens as ordered by this user
	
	//ons
	static async OnTokenupdate(pToken, pchanges, pInfos, pID) {} //called when a token updates
	
	static OnTokenrefresh(pToken, pInfos) {} //called when a token refreshes
	
	static OnCanvasReady(pCanvas) {} //called when a new canvas is readied
	
	static OnStartFollowing(pToken, pFollowed, pPopup = true) {} //called when pToken starts following
	
	static OnStopFollowing(pToken, pPopup = true) {} //called wehn pToken stops following
	
	static OnCombatantUpdate(pCombatant) {} //called when a combatant is created/deleted
	
	//IMPLEMENTATIONS
	static FollowingActive() {
		return game.settings.get(cModuleName, "EnableFollowing") && (RideableCompUtils.isactiveModule(cRoutingLib) || (game.settings.get(cModuleName, "FollowingAlgorithm") == "SimplePathHistory"));
	}
	
	static async FollowToken(pFollowers, pTarget, pDistance = -1) {
		let vFollowers = pFollowers.filter(vFollower => (vFollower != pTarget));//.filter(vFollower => !RideableFlags.isFollowing(vFollower));
		
		for (let i = 0; i < vFollowers.length; i++) {
			if (RideableFlags.isFollowingToken(pTarget, vFollowers[i])) {
				RideablePopups.TextPopUpID(vFollowers[i] ,"TargetisFollowingMe", {pFollowedName : RideableFlags.RideableName(pTarget)}, {type : "error"}); //MESSAGE POPUP
			}
		}
		vFollowers = vFollowers.filter(vFollower => !RideableFlags.isFollowingToken(pTarget, vFollower));
		
		let vDistance;
		
		let vDefaultDistance = pDistance;

		for (let i = 0; i < vFollowers.length; i++) {
			if (!vFollowers[i].inCombat || game.settings.get(cModuleName, "FollowingCombatBehaviour") == "continue") {
				if (vDefaultDistance >= 0) {
					vDistance = vDefaultDistance;
				}
				else {
					vDistance = GeometricUtils.TokenDistance(vFollowers[i], pTarget);
				}
				
				await RideableFlags.startFollowing(vFollowers[i], pTarget, vDistance);
				
				FollowingManager.OnStartFollowing(vFollowers[i], pTarget);
			}
			else {
				RideablePopups.TextPopUpID(vFollowers[i], "CantFollowinCombat", {}, {type : "error"}); //MESSAGE POPUP
			}
		}
		
		FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pTarget, Scene : pTarget.parent});
	}
	
	static async StopFollowing(pFollowers, pPopup) {
		for (let i = 0; i < pFollowers.length; i++) {
			if (RideableFlags.isFollowing(pFollowers[i])) {
				await RideableFlags.stopFollowing(pFollowers[i]);
						
				FollowingManager.OnStopFollowing(pFollowers[i], pPopup);
			}
		}
	}
	
	static async SelectedFollowHovered(pConsiderTargeted = true, pDistance = -1) {
		if (FollowingManager.FollowingActive()) {
			let vFollowers = RideableUtils.selectedTokens();
			
			let vTarget = RideableUtils.hoveredRideableToken();
			
			if (!vTarget && pConsiderTargeted) {
				vTarget = RideableUtils.targetedTokens()[0];
			}
			
			if (vFollowers.length > 0 && vTarget) {
				await FollowingManager.FollowToken(vFollowers, vTarget, pDistance);
			}
		}
	}
	
	static async SelectedStopFollowing(pPopup = true) {
		if (FollowingManager.FollowingActive()) {
			let vFollowers = RideableUtils.selectedTokens();
			
			FollowingManager.StopFollowing(vFollowers, pPopup);
		}
	}
	
	static async SelectedToggleFollwing(pConsiderTargeted = true, pDistance = -1) {
		if (FollowingManager.FollowingActive()) {
			let vTarget = RideableUtils.hoveredRideableToken();
			
			if (!vTarget && pConsiderTargeted) {
				vTarget = RideableUtils.targetedTokens()[0];
			}
			
			let vSelected = RideableUtils.selectedTokens();

			let vPreFollowers = [];
			
			if (vTarget) {
				vPreFollowers = vSelected.filter(vToken => RideableFlags.isFollowingToken(vToken, vTarget));
			}
			else {
				vPreFollowers = vSelected;
			}
			
			let vPostFollowers = vSelected.filter(vToken => !vPreFollowers.includes(vToken));
			
			if (vPreFollowers.length && !vPostFollowers.length) {
				FollowingManager.StopFollowing(vPreFollowers);
			}
			
			if (vTarget && vPostFollowers.length) {
				await FollowingManager.FollowToken(vPostFollowers, vTarget, pDistance);
			}
		}
	} 
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Distance : undefined, Target : undefined, Scene : undefined, RidingMovement : false}) {
		if (pFollowers.length > 0) {
			let vScene = pInfos.Scene;
			
			let vSceneDistanceFactor;
			
			let vTarget = pInfos.Target;
			
			let vDistance = pInfos.Distance;
				
			if (vScene) {
				vSceneDistanceFactor = (vScene.dimensions.size)/(vScene.dimensions.distance);
			}

			for (let i = 0; i < pFollowers.length; i++) {
				//calculate target and scene (if necessary)
				if (!pInfos.Scene) {
					vScene = pFollowers[i].parent;
					
					vSceneDistanceFactor = (vScene.dimensions.size)/(vScene.dimensions.distance);
				}
				
				if (!pInfos.Target) {
					vTarget = vScene.tokens.get(RideableFlags.followedID(pFollowers[i]));
				}	
				
				if (vDistance == undefined) {
					vDistance = RideableFlags.FollowDistance(pFollowers[i]);
				}

				//calculate and start new route
				let vRoute;
				
				switch(game.settings.get(cModuleName, "FollowingAlgorithm")) {
					case "SimplePathHistory":
						vRoute = await FollowingManager.SimplePathHistoryRoute(pFollowers[i], vTarget, vDistance * vSceneDistanceFactor, pInfos);
						break;
					case cRoutingLib:
						vRoute = await RideableCompUtils.RLRoute(pFollowers[i], vTarget, pInfos.changes, vDistance * vSceneDistanceFactor);
						break;
				}
				
				vRoute.forEach(vPoint => vPoint.RidingMovement = pInfos.RidingMovement);
				
				await RideableFlags.setplannedRoute(pFollowers[i], vRoute);
				
				if (pInfos.StartRoute) {
					FollowingManager.gotonextPointonRoute(pFollowers[i]);
				}
			}
		}
	}
	
	static async gotonextPointonRoute(pToken) {
		if (RideableFlags.hasPlannedRoute(pToken)) {
			await RideableFlags.shiftRoute(pToken);
			
			let vPoint = RideableFlags.nextRoutePoint(pToken);
			
			if (vPoint && Object.keys(vPoint).length) {
				await pToken.update(vPoint, {RideableFollowingMovement : true, RidingMovement : vPoint.RidingMovement});
			}
			else {
				if (game.settings.get(cModuleName, "PreventFollowerStacking")) {
					FollowingManager.PlanDestack(pToken);
				}
			}
		}
	}

	static async PlanDestack(pToken) {
		let vColliders = canvas.tokens.placeables.map(vToken => vToken.document).filter(vToken => RideableFlags.isFollowingSameToken(vToken, pToken) && vToken != pToken);
		
		vColliders = vColliders.filter(vToken => !RideableFlags.RidingConnection(vToken, pToken));
		
		vColliders.push(canvas.tokens.placeables.find(vToken => RideableFlags.isFollowingToken(pToken, vToken.document))?.document);
		
		vColliders.push(canvas.tokens.placeables.find(vToken => RideableFlags.isGrappledby(pToken, vToken.document))?.document); //for grapple
		
		let vCollided = vColliders.find(vToken => GeometricUtils.DistanceXY(vToken?.object?.center, pToken.object?.center) < Math.min(vToken?.object.w + pToken.object.w, vToken?.object.h + pToken.object.h)/2);
		
		if (vCollided) {
			let vCorrectionLength = Math.min(vCollided.object.w + pToken.object.w, vCollided.object.h + pToken.object.h)/8;
			
			let vCorrectionVector;
			
			if (pToken.object.center.x != vCollided.object.center.x || pToken.object.center.y != vCollided.object.center.y) {
				vCorrectionVector = [pToken.object.center.x - vCollided.object.center.x, pToken.object.center.y - vCollided.object.center.y];
			}
			else {
				//move Token with higher ID in random direction
				if (pToken.id > vCollided.id) {
					let vXDir = Math.random()-0.5;
					let vYDir = Math.random()-0.5;
					
					vCorrectionVector = [vXDir, vYDir];
				}
			}
			if (vCorrectionVector) {
				let vMinScale = 0;
				
				if (canvas.grid.type > 0) {
					//increase move vector for grid snap
					vMinScale = canvas.grid.size;
				}
				
				vCorrectionVector = GeometricUtils.scaleto(vCorrectionVector, Math.max(vCorrectionLength, vMinScale));
				
				vCorrectionVector = GeometricUtils.GridSnapxy({x : pToken.x + vCorrectionVector[0], y : pToken.y + vCorrectionVector[1]});
				
				vCorrectionVector.RidingMovement = RideableFlags.isGrappled(pToken); //for grapple
				
				if (!CONFIG.Canvas.polygonBackends["move"].testCollision(pToken.object.center, {x : vCorrectionVector.x + pToken.object.w/2, y : vCorrectionVector.y + pToken.object.h/2}, {type : "move", mode: "any"})) {
					await RideableFlags.setplannedRoute(pToken, [{pToken}, vCorrectionVector]);
					
					FollowingManager.gotonextPointonRoute(pToken);
				}
			}
		}
	}
	
	static updateFollowedList(pAddTokens) {
		//vFollowedList = FollowingManager.FollowedTokenList();
	}
	
	static replaceFollowerListIDs(pOldIDs, pNewIDs) {
		pOldIDs.forEach(vID => vFollowedList.delete(vID));
		
		pNewIDs.forEach(vID => vFollowedList.add(vID));
	}
	
	static async updatePathHistory(pToken, pchanges) {
		if (game.settings.get(cModuleName, "FollowingAlgorithm") == "SimplePathHistory") {
			if ((!game.users.find(vUser => vUser.isGM && vUser.active) && pToken.isOwner) || game.user.isGM) {
				//update path history of pToken
				await CanvasAnimation.getAnimation(pToken.object?.animationName)?.promise;
				await RideableFlags.AddtoPathHistory(pToken, GeometricUtils.updatedGeometry(pToken, pchanges));
			}
		}
	}
	
	static OnCombatantUpdate(pCombatant) {
		let vToken = pCombatant?.token;
		
		if (["stop", "stop-includefollowed"].includes(game.settings.get(cModuleName, "FollowingCombatBehaviour"))) {
			if (vToken?.inCombat) {
				if (vToken.isOwner && RideableFlags.isFollowing(vToken) && RideableFlags.isFollowOrderSource(vToken)) {
					FollowingManager.StopFollowing([vToken]);
				}
				
				if (game.settings.get(cModuleName, "FollowingCombatBehaviour") == "stop-includefollowed") {
					let vFollowers = RideableFlags.followingTokens(vToken).filter(vToken => vToken.isOwner && RideableFlags.isFollowOrderSource(vToken));
					
					FollowingManager.StopFollowing(vFollowers);
				}
			}
		}
	}
	
	//support
	static async SimplePathHistoryRoute(pFollower, pTarget, pDistance, pInfos = {}) {
		if (pFollower?.object?.center) {
			let vPathHistory = RideableFlags.GetPathHistory(pTarget);
			
			if (pInfos.changes) {
				vPathHistory.push({...vPathHistory[vPathHistory.length-1], ...GeometricUtils.updatedGeometry(pTarget, pInfos.changes)});
			}
			
			let vRoute = [];
			
			let vLOSPointfound = false;
			
			let i = vPathHistory.length-1;//it is i, who is looping here
			
			while (!vLOSPointfound && i > 0) {
				vRoute.unshift(vPathHistory[i]);
				
				if (!CONFIG.Canvas.polygonBackends["move"].testCollision(pFollower.object.center, vPathHistory[i], {type : "move", mode: "any"})) {
					vLOSPointfound = true;
				}
				else {
					i = i - 1;
				}
			}
			
			vRoute.unshift({...pFollower.object.center, elevation : pFollower.elevation});
			
			if (vLOSPointfound) {
				vRoute = GeometricUtils.CenterRoutetoXY(vRoute, pFollower);
				
				vRoute = GeometricUtils.CutRoute(vRoute, pDistance, pFollower.parent.grid);
				
				return vRoute;
			}
		}
		
		return []; //no route found
	} 
	
	static FollowedTokenList() {
		let vTokens = canvas.tokens.placeables.map(vToken => vToken.document).filter(vToken => vToken.isOwner && RideableFlags.isFollowing(vToken) && RideableFlags.isFollowOrderSource(vToken));

		let vFollowedIDs = vTokens.map(vToken => RideableFlags.followedID(vToken));

		let vNewSet = new Set();
		
		vFollowedIDs.forEach(vID => vNewSet.add(vID));
		
		return vNewSet;
	}
	
	//ons
	static async OnTokenupdate(pToken, pchanges, pInfos, pID) {
		//if (vFollowedList?.has(pToken.id)) {
		if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y")) {
			if (pToken.object?.visible || !game.settings.get(cModuleName, "OnlyfollowViewed")) {
				if (game.settings.get(cModuleName, "FollowingCompatibilityMode")) {
					await FollowingManager.updatePathHistory(pToken, pchanges);
				}
				else {
					FollowingManager.updatePathHistory(pToken, pchanges);
				}
				
				//precheck combat behaviour
				if (!(pToken.inCombat && ["stop-includefollowed", "resumeafter-includefollowed"].includes(game.settings.get(cModuleName, "FollowingCombatBehaviour")))) {
					//only consider owned tokens for which this player is the source of the follow order
					let vFollowers = RideableFlags.followingTokens(pToken).filter(vToken => vToken.isOwner && RideableFlags.isFollowOrderSource(vToken));

					//check combat behaviour
					if (["stop", "stop-includefollowed", "resumeafter", "resumeafter-includefollowed"].includes(game.settings.get(cModuleName, "FollowingCombatBehaviour"))) {
						let vnonCombatants = vFollowers.filter(vFollower => !vFollower.inCombat);
						
						/*
						if (game.settings.get(cModuleName, "FollowingCombatBehaviour") == "stop") {
							let vCombatants = vFollowers.filter(vFollower => vFollower.inCombat);
							
							FollowingManager.StopFollowers(vCombatants);
							for (let i = 0; i < vCombatants.length; i++) {
								//stop combatant followers
								RideableFlags.stopFollowing(vCombatants[i]);
								
								FollowingManager.OnStopFollowing(vCombatants[i]);
							}
						}
						*/
						
						vFollowers = vnonCombatants;
					}
					
					//plan new routes to target
					if (vFollowers.length > 0) {
						FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pToken, changes : pchanges, Scene : pToken.parent});
					}
				}
			}
		}
		//}
		
		if (pToken.isOwner) {
			if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y")) {
				if (RideableFlags.isFollowing(pToken) && !pInfos.RideableFollowingMovement && RideableFlags.isFollowOrderSource(pToken)) {
					switch (game.settings.get(cModuleName, "OnFollowerMovement")) {
						case "updatedistance":
							RideableFlags.UpdateFollowDistance(pToken, GeometricUtils.TokenDistance(pToken, RideableFlags.followedToken(pToken), pchanges));
							break;
						case "stopfollowing":
						default:
							RideableFlags.stopFollowing(pToken);
						
							FollowingManager.OnStopFollowing(pToken);
							break;
					}
				}
			}
		}
	}
	
	static OnTokenrefresh(pToken, pInfos) {
		let vToken = pToken.document;

		if (vToken.isOwner && RideableFlags.isFollowOrderSource(vToken)) {
			if (RideableFlags.hasPlannedRoute(vToken)) {
				if (vToken.object) {
					if (RideableFlags.isnextRoutePoint(vToken, vToken.object.position)) {
						FollowingManager.gotonextPointonRoute(vToken);
					}
				}
			}
		}
	}
	
	static OnCanvasReady(pCanvas) {
		//FollowingManager.updateFollowedList();
	}
	
	static OnStartFollowing(pToken, pFollowed, pPopup = true) {
		if (pPopup) {
			RideablePopups.TextPopUpID(pToken ,"StartFollowing", {pFollowedName : RideableFlags.RideableName(pFollowed)}, {type : "success"}); //MESSAGE POPUP
		}
		
		//FollowingManager.updateFollowedList();
		
		Hooks.call(cModuleName + ".StartFollowing", pToken, pFollowed);
	} 
	
	static OnStopFollowing(pToken, pPopup = true) {
		if (pPopup) {
			RideablePopups.TextPopUpID(pToken ,"StopFollowing", {}, {type : "success"}); //MESSAGE POPUP
		}
		
		//FollowingManager.updateFollowedList();
				
		Hooks.call(cModuleName + ".StopFollowing", pToken);
	}
}

Hooks.once("ready", function () {
	if (FollowingManager.FollowingActive()) {
		Hooks.on("updateToken", (...args) => FollowingManager.OnTokenupdate(...args));
		
		Hooks.on("refreshToken", (...args) => FollowingManager.OnTokenrefresh(...args));
		
		Hooks.on("canvasReady", (...args) => FollowingManager.OnCanvasReady(...args));
		
		Hooks.on(cModuleName + "replaceFollowerListIDs", (pOldIDs, pNewIDs) => FollowingManager.replaceFollowerListIDs(pOldIDs, pNewIDs));
		
		Hooks.on("createCombatant", (pCombatant) => {FollowingManager.OnCombatantUpdate(pCombatant)});
		
		Hooks.on("deleteCombatant", (pCombatant) => {FollowingManager.OnCombatantUpdate(pCombatant)});
	}
});

//exports
export function SelectedFollowHovered(pConsiderTargeted = true) {return FollowingManager.SelectedFollowHovered(pConsiderTargeted)};

export function SelectedFollowHoveredatDistance(pDistance) {return FollowingManager.SelectedFollowHovered(true, pDistance)}

export function SelectedStopFollowing() {return FollowingManager.SelectedStopFollowing()};

export function SelectedToggleFollwing() {return FollowingManager.SelectedToggleFollwing(true)};

export function SelectedToggleFollwingatDistance(pDistance) {return FollowingManager.SelectedToggleFollwing(true, pDistance)};

export function FollowbyID(pFollowerIDs, pTargetID, pSceneID = null, pDistance = -1) {FollowingManager.FollowToken(RideableUtils.TokensfromIDs(pFollowerIDs, game.scenes.get(pSceneID)), RideableUtils.TokenfromID(pTargetID, game.scenes.get(pSceneID)), pDistance)};

export function StopFollowbyID(pFollowerIDs, pSceneID = null) {FollowingManager.StopFollowing(RideableUtils.TokensfromIDs(pFollowerIDs, game.scenes.get(pSceneID)))};

export function calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Distance : undefined, Target : undefined, Scene : undefined, RidingMovement : false}) {FollowingManager.calculatenewRoute(pFollowers, pInfos)};

export function updateFollowedList() {FollowingManager.updateFollowedList()};

export async function updatePathHistory(pToken, pChanges = undefined) {await FollowingManager.updatePathHistory(pToken, pChanges)};

export function RequestreplaceFollowerListIDs ({pPlayers, pOldIDs, pNewIDs} = {}) {if (pPlayers?.includes(game.user.id)) {FollowingManager.replaceFollowerListIDs(pOldIDs, pNewIDs)}}

