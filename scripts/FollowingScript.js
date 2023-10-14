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
	
	static async SelectedToggleFollwing(pConsiderTargeted = true) {} //toggles the selected tokens regarding following
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Target : undefined, Scene : undefined}) {} //calculates the new following route of pFollowers
	
	static async gotonextPointonRoute(pToken) {} //updates pTokens to new point on Route
	
	//ons
	static OnTokenupdate(pToken, pchanges, pInfos, pID) {} //called when a token updates
	
	static OnTokenrefresh(pToken, pInfos) {} //called when a token refreshes
	
	static OnStartFollowing(pToken, pFollowed, pPopup = true) {} //called when pToken starts following
	
	static OnStopFollowing(pToken, pPopup = true) {} //called wehn pToken stops following
	
	//IMPLEMENTATIONS
	static FollowingActive() {
		return RideableCompUtils.isactiveModule(cRoutingLib) && game.settings.get(cModuleName, "EnableFollowing");
	}
	
	static async FollowToken(pFollowers, pTarget, pDistance = -1) {
		let vFollowers = pFollowers.filter(vFollower => (vFollower != pTarget) && !RideableFlags.isFollowingToken(pTarget, vFollower));//.filter(vFollower => !RideableFlags.isFollowing(vFollower));
		
		let vDistance;
		
		let vDefaultDistance = pDistance * (pTarget.parent.dimensions.size)/(pTarget.parent.dimensions.distance);
		
		for (let i = 0; i < vFollowers.length; i++) {
			if (!vFollowers[i].inCombat || game.settings.get(cModuleName, "FollowingCombatBehaviour") == "continue") {
				if (pDistance >= 0) {
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
	
	static async SelectedToggleFollwing(pConsiderTargeted = true) {
		if (FollowingManager.FollowingActive()) {
			let vTarget = RideableUtils.hoveredRideableToken();
			
			if (!vTarget && pConsiderTargeted) {
				vTarget = RideableUtils.targetedTokens()[0];
			}
			
			//if target present, a new token will be followed => no "stop following" popup
			await SelectedStopFollowing(!Boolean(vTarget));
			
			await SelectedFollowHovered();
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
				let vRoute = await RideableCompUtils.RLRoute(pFollowers[i], vTarget, RideableFlags.FollowDistance(pFollowers[i]) * vSceneDistanceFactor);
				
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
	
	//ons
	static OnTokenupdate(pToken, pchanges, pInfos, pID) {
		if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y")) {
			if (pToken.object?.visible || !game.settings.get(cModuleName, "OnlyfollowViewed")) {
				//only consider owned tokens for which this player is the source of the follow order
				let vFollowers = RideableFlags.followingTokens(pToken).filter(vToken => vToken.isOwner && RideableFlags.isFollowOrderSource(vToken));
				
				//check combat behaviour
				if (["stop", "resumeafter"].includes(game.settings.get(cModuleName, "FollowingCombatBehaviour"))) {
					let vnonCombatants = vFollowers.filter(vFollower => !vFollower.inCombat);
					
					if (game.settings.get(cModuleName, "FollowingCombatBehaviour") == "stop") {
						console.log("check1");
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
							console.log(GeometricUtils.TokenDistance(pToken, RideableFlags.followedToken(pToken)));
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
			RideablePopups.TextPopUpID(pToken ,"StartFollowing", {pRiddenName : RideableFlags.RideableName(pFollowed)}); //MESSAGE POPUP
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

export function SelectedToggleFollwing() {return FollowingManager.SelectedToggleFollwing()};