import { RideableFlags } from "./helpers/RideableFlags.js";
import { GeometricUtils } from "./utils/GeometricUtils.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideableCompUtils } from "./compatibility/RideableCompUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";

class FollowingManager {
	//DECLARATIONS
	static FollowToken(pFollowers, pTarget) {} //sets pFollowers to follow pTarget
	
	static SelectedFollowHovered(pConsiderTargeted = true) {} //lets the selected tokens follow the hovered token
	
	static SelectedStopFollowing() {} //makes the selected tokens stop following
	
	static async calculatenewRoute(pFollowers, pInfos = {StartRoute : true, Target : undefined, Scene : undefined}) {} //calculates the new following route of pFollowers
	
	static async gotonextPointonRoute(pToken) {} //updates pTokens to new point on Route
	
	//ons
	static OnTokenupdate(pToken, pchanges, pInfos, pID) {} //called when a token updates
	
	static OnTokenrefresh(pToken, pInfos) {} //called when a token refreshes
	
	static OnStartFollowing(pToken, pFollowed) {} //called when pToken starts following
	
	static OnStopFollowing(pToken) {} //called wehn pToken stops following
	
	//IMPLEMENTATIONS
	static FollowToken(pFollowers, pTarget) {
		let vFollowers = pFollowers;//.filter(vFollower => !RideableFlags.isFollowing(vFollower));
		
		let vDistance;
		
		for (let i = 0; i < vFollowers.length; i++) {
			vDistance = GeometricUtils.TokenDistance(vFollowers[i], pTarget);
			
			RideableFlags.startFollowing(vFollowers[i], pTarget, vDistance);
			
			FollowingManager.OnStartFollowing(vFollowers[i], pTarget);
		}
		
		FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pTarget, Scene : pTarget.parent});
	}
	
	static SelectedFollowHovered(pConsiderTargeted = true) {
		let vFollowers = RideableUtils.selectedTokens();
		
		let vTarget = RideableUtils.hoveredRideableToken();
		
		if (!vTarget && pConsiderTargeted) {
			vTarget = RideableUtils.targetedTokens()[0];
		}
		
		if (vFollowers.length > 0 && vTarget) {
			FollowingManager.FollowToken(vFollowers, vTarget);
		}
	}
	
	static SelectedStopFollowing() {
		let vFollowers = RideableUtils.selectedTokens();
		
		for (let i = 0; i < vFollowers.length; i++) {
			RideableFlags.stopFollowing(vFollowers[i]);
					
			RideableFlags.OnStopFollowing(vFollowers[i]);
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
					vTarget = vScene.tokens.get(RideableFlags.(pFollowers[i]));
				}	

				//calculate and start new route
				await RideableFlags.setplannedRoute(pFollowers[i], await RideableCompUtils.RLRoute(pFollowers[i], vTarget, RideableFlags.FollowDistance(pFollowers[i]) * vSceneDistanceFactor));

				if (pInfos.StartRoute) {
					gotonextPointonRoute(pFollowers[i]);
				}
			}
		}
	}
	
	static async gotonextPointonRoute(pToken) {
		if (RideableFlags.hasPlannedRoute(pToken)) {
			await pToken.update({RideableFlags.nextRoutePoint(pToken)});
			
			await RideableFlags.shiftRoute(pToken);
		}
	} 
	
	//ons
	static OnTokenupdate(pToken, pchanges, pInfos, pID) {
		if (game.user.isGM) {
			if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y")) {
				let vFollowers = RideableFlags.followingTokens(pToken);
				
				if (vFollowers.length > 0) {
					FollowingManager.calculatenewRoute(vFollowers, {StartRoute : true, Target : pToken, Scene : pToken.parent});
				}
				
				if (RideableFlags.isFollowing(pToken)) {
					RideableFlags.stopFollowing(pToken);
					
					RideableFlags.OnStopFollowing(pToken);
				}
			}
		}
	}
	
	static OnTokenrefresh(pToken, pInfos) {
		if (pToken.isOwner) {
			if (RideableFlags.hasPlannedRoute(pToken) {
				if (pToken.object) {
					if (RideableFlags.isnextRoutePoint(pToken, pToken.object.position)) {
						FollowingManager.gotonextPointonRoute(pToken);
					}
				}
			}
		}
	}
	
	static OnStartFollowing(pToken, pFollowed) {
		RideablePopups.TextPopUpID(pToken ,"StartFollowing", {pRiddenName : RideableFlags.RideableName(pFollowed)}); //MESSAGE POPUP
		
		Hooks.call(cModuleName + ".StartFollowing", pToken, pFollowed);
	} 
	
	static OnStopFollowing(pToken) {
		RideablePopups.TextPopUpID(pRider ,"StopFollowing"); //MESSAGE POPUP
		
		Hooks.call(cModuleName + ".StopFollowing", pToken);
	}
}

Hooks.once("routinglib.ready", function () {
	Hooks.on("updateToken", (...args) => FollowingManager.OnTokenupdate(...args));
	
	Hooks.on("refreshToken", (...args) => FollowingManager.OnTokenrefresh(...args));
});

//exports
export function SelectedFollowHovered(pConsiderTargeted = true) {return FollowingManager.SelectedFollowHovered(true)};

export function SelectedStopFollowing() {return FollowingManager.SelectedStopFollowing()};