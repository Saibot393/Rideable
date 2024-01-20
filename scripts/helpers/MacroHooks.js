import { MountSelected, MountSelectedFamiliar, UnMountSelected, GrappleTargeted, ToggleMountselected } from "../MountingScript.js";
import { Mount, UnMount, ToggleMount, UnMountallRiders, MountbyID, UnMountbyID, UnMountallRidersbyID, TogglePilotingSelected, TogglePositionLock, TogglePositionLockSelected } from "../MountingScript.js";
import { SelectedFollowHovered, SelectedFollowHoveredatDistance, SelectedStopFollowing, SelectedToggleFollwing, SelectedToggleFollwingatDistance, FollowbyID, StopFollowbyID } from "../FollowingScript.js";

//functions for macros
Hooks.on("init",() => {
	game.Rideable = {
		MountSelected, //game.Rideable.MountSelected() -> Makes selected Tokens Ride targeted Token
		MountSelectedFamiliar,
		UnMountSelected,
		GrappleTargeted,
		Mount,
		UnMount,
		ToggleMount,
		UnMountallRiders,
		MountbyID,
		UnMountbyID,
		UnMountallRidersbyID,
		ToggleMountselected,
		TogglePilotingSelected,
		SelectedFollowHovered,
		SelectedFollowHoveredatDistance,
		SelectedStopFollowing,
		SelectedToggleFollwing,
		SelectedToggleFollwingatDistance,
		FollowbyID, 
		StopFollowbyID,
		TogglePositionLock, 
		TogglePositionLockSelected
	};
});