import { RideableFlags } from "./helpers/RideableFlags.js";
import { GeometricUtils } from "./utils/GeometricUtils.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideableCompUtils, cRoutingLib } from "./compatibility/RideableCompUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";

class FollowingManager {
	//DECLARATIONS
	static FollowingActive() {} //returns if the token following feature is active
	
	static async FollowToken(pFollowers, pTarget, pDistance = -1) {} //sets pFollowers to follow pTarget
	
	static async SelectedFollowHovered(pConsiderTargeted = true, pDistance = -1) {} //lets the selected tokens follow the hovered token
	
	static async SelectedStopFollowing(pPopup = true) {} //makes the selected tokens stop following
	
	static async SelectedToggleFollwing(pConsiderTargeted = true, pDistance = -1) {} //toggles the selected tokens regarding following
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Target : undefined, Scene : undefined}) {} //calculates the new following route of pFollowers
	
	static async gotonextPointonRoute(pToken) {} //updates pTokens to new point on Route
	
	//support
	static async SimplePathHistoryRoute(pFollower, pTarget, pDistance) {} //returns the route for pFollower to follow pTarget at pDistance
	
	//ons
	static async OnTokenupdate(pToken, pchanges, pInfos, pID) {} //called when a token updates
	
	static OnTokenrefresh(pToken, pInfos) {} //called when a token refreshes
	
	static OnStartFollowing(pToken, pFollowed, pPopup = true) {} //called when pToken starts following
	
	static OnStopFollowing(pToken, pPopup = true) {} //called wehn pToken stops following
	
	//IMPLEMENTATIONS
	static FollowingActive() {
		return RideableCompUtils.isactiveModule(cRoutingLib) && game.settings.get(cModuleName, "EnableFollowing");
	}
	
	static async FollowToken(pFollowers, pTarget, pDistance = -1) {
		let vFollowers = pFollowers.filter(vFollower => (vFollower != pTarget));//.filter(vFollower => !RideableFlags.isFollowing(vFollower));
		
		for (let i = 0; i < vFollowers.length; i++) {
			if (RideableFlags.isFollowingToken(pTarget, vFollowers[i])) {
				RideablePopups.TextPopUpID(vFollowers[i] ,"TargetisFollowingMe", {pFollowedName : RideableFlags.RideableName(pTarget)}); //MESSAGE POPUP
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
				RideablePopups.TextPopUpID(vFollowers[i] ,"CantFollowinCombat"); //MESSAGE POPUP
			}
		}
		
		//FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pTarget, Scene : pTarget.parent});
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
			
			for (let i = 0; i < vFollowers.length; i++) {
				if (RideableFlags.isFollowing(vFollowers[i])) {
					await RideableFlags.stopFollowing(vFollowers[i]);
							
					FollowingManager.OnStopFollowing(vFollowers[i], pPopup);
				}
			}
		}
	}
	
	static async SelectedToggleFollwing(pConsiderTargeted = true, pDistance = -1) {
		if (FollowingManager.FollowingActive()) {
			let vTarget = RideableUtils.hoveredRideableToken();
			
			if (!vTarget && pConsiderTargeted) {
				vTarget = RideableUtils.targetedTokens()[0];
			}
			
			//if target present, a new token will be followed => no "stop following" popup
			await FollowingManager.SelectedStopFollowing(!Boolean(vTarget));
			
			await FollowingManager.SelectedFollowHovered(pConsiderTargeted, pDistance);
		}
	} 
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Target : undefined, Scene : undefined}) {
		if (pFollowers.length > 0) {
			let vScene;
			
			let vSceneDistanceFactor;
			
			let vTarget;
			
			vScene = pInfos.Scene;
				
			if (vScene) {
				vSceneDistanceFactor = (vScene.dimensions.size)/(vScene.dimensions.distance);
			}
			
			vTarget = pInfos.Target;
			
			for (let i = 0; i < pFollowers.length; i++) {
				//calculate target and scene (if necessary)
				if (!pInfos.Scene) {
					vScene = pFollowers[i].parent;
					
					vSceneDistanceFactor = (vScene.dimensions.size)/(vScene.dimensions.distance);
				}
				
				if (!pInfos.Target) {
					vTarget = vScene.tokens.get(RideableFlags.followedID(pFollowers[i]));
				}	

				//calculate and start new route
				let vRoute;
				switch(game.settings.get(cModuleName, "FollowingAlgorithm")) {
					case "SimplePathHistory":
						vRoute = await FollowingManager.SimplePathHistoryRoute(pFollowers[i], vTarget, RideableFlags.FollowDistance(pFollowers[i]) * vSceneDistanceFactor);
						break;
					case cRoutingLib:
						vRoute = await RideableCompUtils.RLRoute(pFollowers[i], vTarget, RideableFlags.FollowDistance(pFollowers[i]) * vSceneDistanceFactor);
						break;
				}
				
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
			
			if (vPoint) {
				await pToken.update(vPoint, {RideableFollowingMovement : true});
			}
		}
	} 
	
	//support
	static async SimplePathHistoryRoute(pFollower, pTarget, pDistance) {
		let vPathHistory = RideableFlags.GetPathHistory(pTarget);
		
		let vRoute = [];
		
		let vLOSPointfound = false;
		
		let i = vPathHistory.length-1;//it is i, who is looping here
		
		while (!vLOSPointfound && i > 0) {
			let vRay = new Ray(pFollower.center, vPathHistory[i]);
			
			if (canvas.walls.checkCollision(vRay, {type: "move", mode: "any"})) {
				vLOSPointfound = true;
			}
			else {
				vRoute.push(vPathHistory[i]);
				
				i = i - 1;
			}
		}
		
		if (vLOSPointfound) {
			//cut route here
			
			return vRoute;
		}
		else {
			return []; //no route found
		}
	} 
	
	//ons
	static async OnTokenupdate(pToken, pchanges, pInfos, pID) {
		if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y")) {
			if (pToken.object?.visible || !game.settings.get(cModuleName, "OnlyfollowViewed")) {
				if (game.settings.get(cModuleName, "FollowingAlgorithm") == "SimplePathHistory") {
					//update path history of pToken
					await RideableFlags.AddtoPathHistory(pToken);
				}
				
				//only consider owned tokens for which this player is the source of the follow order
				let vFollowers = RideableFlags.followingTokens(pToken).filter(vToken => vToken.isOwner && RideableFlags.isFollowOrderSource(vToken));
				
				//check combat behaviour
				if (["stop", "resumeafter"].includes(game.settings.get(cModuleName, "FollowingCombatBehaviour"))) {
					let vnonCombatants = vFollowers.filter(vFollower => !vFollower.inCombat);
					
					if (game.settings.get(cModuleName, "FollowingCombatBehaviour") == "stop") {
						let vCombatants = vFollowers.filter(vFollower => vFollower.inCombat);
						
						for (let i = 0; i < vCombatants.length; i++) {
							//stop combatant followers
							RideableFlags.stopFollowing(vCombatants[i]);
							
							FollowingManager.OnStopFollowing(vCombatants[i], false);
						}
					}
					
					vFollowers = vnonCombatants;
				}
				
				//plan new routes to target
				if (vFollowers.length > 0) {
					FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pToken, Scene : pToken.parent});
				}
			}
			
			if (pToken.isOwner) {
				if (RideableFlags.isFollowing(pToken) && !pInfos.RideableFollowingMovement && RideableFlags.isFollowOrderSource(pToken)) {
					switch (game.settings.get(cModuleName, "OnFollowerMovement")) {
						case "updatedistance":
							RideableFlags.UpdateFollowDistance(pToken, GeometricUtils.TokenDistance(pToken, RideableFlags.followedToken(pToken)));
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
	
	static OnStartFollowing(pToken, pFollowed, pPopup = true) {
		if (pPopup) {
			RideablePopups.TextPopUpID(pToken ,"StartFollowing", {pFollowedName : RideableFlags.RideableName(pFollowed)}); //MESSAGE POPUP
		}
		
		Hooks.call(cModuleName + ".StartFollowing", pToken, pFollowed);
	} 
	
	static OnStopFollowing(pToken, pPopup = true) {
		if (pPopup) {
			RideablePopups.TextPopUpID(pToken ,"StopFollowing"); //MESSAGE POPUP
		}
				
		Hooks.call(cModuleName + ".StopFollowing", pToken);
	}
}

Hooks.once("routinglib.ready", function () {
	if (FollowingManager.FollowingActive()) {
		Hooks.on("updateToken", (...args) => FollowingManager.OnTokenupdate(...args));
		
		Hooks.on("refreshToken", (...args) => FollowingManager.OnTokenrefresh(...args));
	}
});

//exports
export function SelectedFollowHovered(pConsiderTargeted = true) {return FollowingManager.SelectedFollowHovered(pConsiderTargeted)};

export function SelectedFollowHoveredatDistance(pDistance) {return FollowingManager.SelectedFollowHovered(true, pDistance)}

export function SelectedStopFollowing() {return FollowingManager.SelectedStopFollowing()};

export function SelectedToggleFollwing() {return FollowingManager.SelectedToggleFollwing(true)};

export function SelectedToggleFollwingatDistance(pDistance) {return FollowingManager.SelectedToggleFollwing(true, pDistance)};